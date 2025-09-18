# Layer Addition Process Guide

This document maps out the complete flow for adding new analysis layers to the HLPV web application, using AONB (Areas of Outstanding Natural Beauty) as a detailed example.

## Overview: Polygon → SQL → Risk Levels → Rules → Report Generator

The system follows this architectural flow:
1. **User draws polygon** on the frontend map
2. **SQL analysis function** performs spatial analysis against geospatial datasets
3. **Risk levels** are defined and standardized across the application
4. **Business rules** process the SQL results and apply planning logic
5. **Report generator** formats the results for display

---

## Step-by-Step Process: AONB Example

### 1. SQL Analysis Layer
**File:** `/backend/sql/landscape_analysis/analyze_AONB.sql`

**Purpose:** Performs spatial analysis between user-drawn polygon and AONB geospatial data

**Function Signature:**
```sql
CREATE OR REPLACE FUNCTION analyze_aonb(polygon_geojson TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  dist_m INTEGER,
  on_site BOOLEAN,
  within_50m BOOLEAN,
  within_100m BOOLEAN,
  within_250m BOOLEAN,
  within_500m BOOLEAN,
  within_1km BOOLEAN,
  within_3km BOOLEAN,
  within_5km BOOLEAN,
  direction TEXT
)
```

**Key Features:**
- Converts GeoJSON polygon to PostGIS geometry
- Transforms to British National Grid (EPSG:27700) for accurate distance calculations
- Calculates distance buckets (on-site, 50m, 100m, 250m, 500m, 1km, 3km, 5km)
- Determines direction from site to features using azimuth calculation
- Returns only features within 5km of the site

**Data Source:** `public."AONB"` table with geometry column

### 2. Aggregator Function Integration
**File:** `/backend/sql/create_analysis_functions.sql`

**Purpose:** Combines individual analysis functions into domain-specific aggregators

```sql
CREATE OR REPLACE FUNCTION analyze_site_landscape(polygon_geojson TEXT)
RETURNS JSON AS $$
DECLARE
  aonb_result JSON;
  green_belt_result JSON;
  combined_result JSON;
BEGIN
  -- Get AONB analysis
  SELECT json_agg(row_to_json(t)) INTO aonb_result
  FROM (SELECT * FROM analyze_aonb(polygon_geojson)) t;
  
  -- Get Green Belt analysis  
  SELECT json_agg(row_to_json(t)) INTO green_belt_result
  FROM (SELECT * FROM analyze_green_belt(polygon_geojson)) t;
  
  -- Combine results
  SELECT json_build_object(
    'aonb', COALESCE(aonb_result, '[]'::json),
    'green_belt', COALESCE(green_belt_result, '[]'::json)
  ) INTO combined_result;
  
  RETURN combined_result;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 3. Backend Query Builder
**File:** `/backend/src/queries.js`

**Purpose:** Builds parameterized queries for database execution

```javascript
export function buildLandscapeAnalysisQuery(geojsonPolygon) {
  const text = `SELECT analyze_site_landscape($1) as analysis_result;`;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}
```

### 4. Risk Level Definitions
**File:** `/backend/src/rules/riskLevels.js`

**Purpose:** Centralized risk level constants used across all planning domains

```javascript
export const RISK_LEVELS = {
  SHOWSTOPPER: 'showstopper',
  EXTREMELY_HIGH_RISK: 'extremely_high_risk',
  HIGH_RISK: 'high_risk',
  MEDIUM_RISK: 'medium_risk',
  MEDIUM_HIGH_RISK: 'medium_high_risk',
  MEDIUM_LOW_RISK: 'medium_low_risk',
  LOW_RISK: 'low_risk'
};
```

### 5. Business Rules Engine
**File:** `/backend/src/rules/landscape/aonbRulesRich.js`

**Purpose:** Applies planning-specific business logic to SQL analysis results

**Rule Structure:**
Each rule function follows this pattern:
```javascript
export function checkAONBOnSite(aonbAreas) {
  const onSite = (aonbAreas || []).filter(a => a.on_site);
  if (onSite.length === 0) return { triggered: false };
  
  return {
    id: 'aonb_on_site',
    triggered: true,
    level: RISK_LEVELS.EXTREMELY_HIGH_RISK,
    rule: 'AONB On-Site',
    findings: `${onSite.length} AONB area${onSite.length > 1 ? 's' : ''} intersecting site`,
    recommendations: [
      'Major planning weight will be given to conserving and enhancing landscape and scenic beauty',
      'Early engagement with landscape specialists required',
      'Landscape and visual impact assessment required'
    ],
    areas: onSite
  };
}
```

**Distance-Based Rule Hierarchy:**
- **On-site:** EXTREMELY_HIGH_RISK
- **Within 50m:** HIGH_RISK  
- **Within 100m:** HIGH_RISK
- **Within 250m:** MEDIUM_HIGH_RISK
- **Within 500m:** MEDIUM_RISK
- **Within 1km:** MEDIUM_LOW_RISK
- **Within 3km:** LOW_RISK
- **Within 5km:** LOW_RISK

**Rule Processing Pipeline:**
```javascript
export function processAONBRules(analysisData) {
  const aonb = analysisData?.aonb || [];
  const triggeredRules = [];
  
  const pipeline = [
    checkAONBOnSite,
    checkAONBWithin50m,
    checkAONBWithin100m,
    checkAONBWithin250m,
    checkAONBWithin500m,
    checkAONBWithin1km,
    checkAONBWithin3km,
    checkAONBWithin5km
  ];
  
  for (const rule of pipeline) {
    const result = rule(aonb);
    if (result.triggered) triggeredRules.push(result);
  }
  
  return { 
    rules: triggeredRules, 
    aonb,
    defaultTriggeredRecommendations: triggeredRules.length > 0 ? DEFAULT_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: triggeredRules.length === 0 ? DEFAULT_NO_RULES_RECOMMENDATIONS : []
  };
}
```

### 6. Domain-Level Rule Aggregation
**File:** `/backend/src/rules/landscape/index.js`

**Purpose:** Combines rules from multiple landscape layers and determines overall risk

```javascript
export function processLandscapeRules(analysisData) {
  const gb = processGreenBeltRules(analysisData);
  const ab = processAONBRules(analysisData);

  const rules = [...gb.rules, ...ab.rules].map(r => ({ ...r }));

  // Overall risk picks highest severity (rules ordered from highest to lowest per layer)
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  return {
    rules,
    overallRisk,
    green_belt: gb.green_belt,
    aonb: ab.aonb,
    defaultTriggeredRecommendations: [...gb.defaultTriggeredRecommendations, ...ab.defaultTriggeredRecommendations],
    defaultNoRulesRecommendations: [...gb.defaultNoRulesRecommendations, ...ab.defaultNoRulesRecommendations]
  };
}
```

### 7. Server Endpoint
**File:** `/backend/src/server.js`

**Purpose:** HTTP endpoint that orchestrates database query and rule processing

```javascript
app.post('/analyze/landscape', async (req, res) => {
  try {
    const { polygon } = req.body;
    
    // 1. Execute SQL analysis
    const { text, values } = buildLandscapeAnalysisQuery(polygon);
    const result = await pool.query(text, values);
    const analysisResult = result.rows[0]?.analysis_result || {};

    // 2. Process business rules
    const rulesAssessment = processLandscapeRules(analysisResult);

    // 3. Build enriched response
    const response = {
      green_belt: analysisResult.green_belt || [],
      aonb: analysisResult.aonb || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || 0,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRulesProcessed: 10, // 2 Green Belt + 8 AONB rule checks
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: 'landscape-rules-v2'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Landscape analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 8. Frontend API Service
**File:** `/frontend/src/lib/services/api.js`

**Purpose:** Frontend service for making API calls (implementation varies by frontend architecture)

### 9. Report Generation
**File:** `/frontend/src/lib/services/landscape/landscapeReportGenerator.js`

**Purpose:** Transforms backend rule results into frontend-displayable report format

```javascript
export function buildLandscapeReport(backend) {
  const greenBelt = backend?.green_belt ?? [];
  const rules = Array.isArray(backend?.rules) ? backend.rules : [];
  const overallRisk = backend?.overallRisk ?? 0;

  // Transform server rules for frontend display
  const triggeredRules = rules.map(r => ({
    rule: r.rule,
    level: r.level,
    findings: r.findings,
    recommendations: r.recommendations || []
  }));

  return {
    designationSummary: [/* summary text for UI */],
    riskAssessment: {
      overallRisk,
      riskSummary: resolveRiskSummary(overallRisk),
      triggeredRules
    },
    lists: {
      greenBelt: { 
        detailed: greenBelt, 
        within1kmCount: greenBelt.filter(gb => !gb.on_site && gb.within_1km).length 
      }
    },
    metadata: backend?.metadata || {}
  };
}
```

### 10. UI Component
**File:** `/frontend/src/lib/components/ReportGenerator.svelte`

**Purpose:** Svelte component that displays the final report to users

---

## Adding a New Layer: Checklist

To add a new analysis layer (e.g., "National Parks"), follow these steps:

### 1. Database Setup
- [ ] Ensure geospatial dataset is loaded into PostgreSQL with appropriate SRID
- [ ] Verify table structure includes geometry column and identifying fields

### 2. SQL Analysis Function
- [ ] Create `/backend/sql/[domain]_analysis/analyze_[layer_name].sql`
- [ ] Implement spatial analysis with distance buckets (on_site, within_50m, etc.)
- [ ] Include direction calculation if relevant
- [ ] Test function with sample polygon

### 3. Domain Aggregator Function
- [ ] Add new layer to appropriate domain aggregator in `/backend/sql/create_analysis_functions.sql`
- [ ] Update JSON response structure to include new layer

### 4. Query Builder
- [ ] Add query builder function to `/backend/src/queries.js` (if needed for individual layer)
- [ ] Update existing domain query builder if adding to existing domain

### 5. Risk Level Mapping
- [ ] Confirm risk levels in `/backend/src/rules/riskLevels.js` cover your needs
- [ ] Add new levels if required (maintain consistency across domains)

### 6. Business Rules
- [ ] Create `/backend/src/rules/[domain]/[layerName]RulesRich.js`
- [ ] Implement distance-based rule functions following established pattern
- [ ] Define planning-appropriate recommendations for each rule
- [ ] Create main processing function with rule pipeline

### 7. Domain Rules Integration
- [ ] Update `/backend/src/rules/[domain]/index.js` to include new layer rules
- [ ] Ensure overall risk calculation includes new layer
- [ ] Combine default recommendations appropriately

### 8. Server Endpoint
- [ ] Update domain endpoint in `/backend/src/server.js` to handle new layer
- [ ] Add appropriate logging and error handling
- [ ] Update metadata to reflect new rule count

### 9. Frontend Report Builder
- [ ] Update `/frontend/src/lib/services/[domain]/[domain]ReportGenerator.js`
- [ ] Add new layer data to report structure
- [ ] Include summary counts and display logic

### 10. UI Integration
- [ ] Update relevant Svelte components to display new layer data
- [ ] Add any layer-specific UI components if needed
- [ ] Test end-to-end flow

---

## Key Principles

1. **Separation of Concerns:** SQL handles spatial analysis, JavaScript handles business logic
2. **Consistent Distance Buckets:** Use standard distance thresholds across all layers
3. **Risk Level Standardization:** Use centralized risk levels for consistency
4. **Rule Hierarchy:** Process rules from highest to lowest risk severity
5. **Domain Aggregation:** Group related layers by planning domain (heritage, landscape, etc.)
6. **Error Handling:** Implement comprehensive error handling at each layer
7. **Metadata Tracking:** Include generation timestamps, rule counts, and version info
8. **Testing:** Test each component individually and end-to-end integration

---

## File Structure Summary

```
backend/
├── sql/
│   ├── landscape_analysis/
│   │   └── analyze_AONB.sql                    # Individual layer SQL
│   └── create_analysis_functions.sql           # Domain aggregators
├── src/
│   ├── rules/
│   │   ├── riskLevels.js                      # Centralized risk definitions
│   │   └── landscape/
│   │       ├── aonbRulesRich.js               # Layer-specific rules
│   │       └── index.js                       # Domain rule aggregation
│   ├── queries.js                             # Query builders
│   └── server.js                              # HTTP endpoints

frontend/
├── src/lib/
│   ├── services/
│   │   ├── api.js                             # API client
│   │   └── landscape/
│   │       └── landscapeReportGenerator.js    # Report formatting
│   └── components/
│       └── ReportGenerator.svelte             # UI display
```

This architecture ensures maintainability, consistency, and scalability as new layers are added to the system.

---

## Renewables Analysis Flow: Validation Example

To validate my understanding of the system architecture, let me trace through the **Renewables** analysis flow, which demonstrates some interesting variations from the standard AONB pattern:

### 1. SQL Analysis Function - Enhanced Filtering
**File:** `/backend/sql/renewables_analysis/analyze_renewables.sql`

**Key Differences from AONB:**
- **Data Filtering:** Applies business logic filters in SQL (Solar PV only, >10MW capacity, specific statuses)
- **Status Tracking:** Includes development status fields (Application Submitted, Operational, etc.)
- **Capacity Information:** Tracks installed capacity in MW for risk assessment

```sql
-- Renewable energy points filtered by technology type
ren_points AS (
  SELECT /* ... columns ... */
  FROM public."Renewable Energy developments Q1 2025" r
  WHERE r."Technology Type" = 'Solar Photovoltaics'
    AND r.geom IS NOT NULL
    AND r."Development Status (short)" IN ('Appeal Refused', 'Application Refused', 
         'Application Submitted', 'Awaiting Construction', 'Operational', 'Revised', 'Under Construction')
    AND (
      r."Installed Capacity (MWelec)" ~ '^[0-9]+\.?[0-9]*$' 
      AND CAST(r."Installed Capacity (MWelec)" AS NUMERIC) > 10
    )
)
```

**Same Distance Pattern:** Uses identical distance buckets (on_site, 50m, 100m, 250m, 500m, 1km, 3km, 5km)

### 2. Aggregator Integration - Standalone Domain
**File:** `/backend/sql/create_analysis_functions.sql`

**Difference:** Renewables gets its own domain function (not combined with other layers like landscape does)

```sql
CREATE OR REPLACE FUNCTION analyze_site_renewables(polygon_geojson TEXT)
RETURNS JSON AS $$
-- Single-layer domain (unlike landscape which combines AONB + Green Belt)
```

### 3. Business Rules - Context-Specific Logic
**File:** `/backend/src/rules/renewables/renewablesRulesRich.js`

**Key Innovations:**
- **Per-Development Rules:** Creates individual rules for each renewable development (vs. aggregate distance rules)
- **Status-Based Risk:** Risk varies dramatically based on development status
- **Compound Risk Assessment:** Combines distance + status for risk calculation

**Status-Based Risk Hierarchy:**
```javascript
// Refused applications - informational only
if (status === 'Appeal Refused' || status === 'Application Refused') {
  riskLevel = RISK_LEVELS.LOW_RISK; // Regardless of distance
}

// Active applications - distance-based scaling
else if (status === 'Application Submitted' || status === 'Awaiting Construction') {
  if (on_site || within_250m) riskLevel = RISK_LEVELS.EXTREMELY_HIGH_RISK;
  else if (within_1km) riskLevel = RISK_LEVELS.HIGH_RISK;
  else if (within_3km) riskLevel = RISK_LEVELS.MEDIUM_RISK;
  else if (within_5km) riskLevel = RISK_LEVELS.MEDIUM_LOW_RISK;
}

// Committed developments - highest risk
else if (status === 'Under Construction' || status === 'Operational') {
  if (on_site || within_250m) riskLevel = RISK_LEVELS.SHOWSTOPPER; // ⚠️ Only place SHOWSTOPPER appears!
  else if (within_1km) riskLevel = RISK_LEVELS.EXTREMELY_HIGH_RISK;
  // ... scales down by distance
}
```

**Individual Development Rules:** Unlike AONB's aggregate approach, renewables creates one rule per development
```javascript
triggeredRules.push({
  id: `renewables-${development.id}`, // Unique per development
  triggered: true,
  level: riskLevel,
  rule: ruleTitle, // e.g., "Operational Solar Development (250m)"
  findings: `Large-scale solar development (${capacity} MW) ${on_site ? 'on-site' : `at ${dist_m}m ${direction}`}`,
  recommendations: [...] // Status-specific recommendations
});
```

### 4. Server Endpoint - Enhanced Logging
**File:** `/backend/src/server.js` (lines 215-267)

**Adds:** Technology type and capacity logging for debugging:
```javascript
console.log('[Renewables] count:', renewablesArr.length, 
  'on_site:', renewablesArr.filter(r => r?.on_site).length, 
  'tech types:', [...new Set(renewablesArr.map(r => r.technology_type))].join(', '));
```

### 5. Frontend Results Component - Rich Display
**File:** `/frontend/src/lib/components/Results ribbons/RenewablesResults.svelte`

**Enhanced UI Features:**
- **Technology Icons:** Visual indicators for Solar/Wind/Battery
- **Status Badges:** Color-coded proximity and direction badges  
- **Capacity Display:** Shows MW capacity prominently
- **Development Details:** Shows technology, status, capacity, and distance

**Distance Badge Logic:**
```javascript
function getStatusBadges(item) {
  const badges = [];
  
  if (item.on_site) badges.push({ text: 'ON SITE', class: 'badge-on-site' });
  else if (item.within_50m) badges.push({ text: 'WITHIN 50M', class: 'badge-nearby' });
  // ... cascading distance logic
  
  if (item.direction && item.direction !== 'N/A') {
    badges.push({ text: item.direction, class: 'badge-direction' });
  }
  
  return badges;
}
```

### Key Architectural Differences

| Aspect | AONB (Standard) | Renewables (Enhanced) |
|--------|-----------------|----------------------|
| **Data Filtering** | Minimal (just geometry validation) | Heavy (technology, capacity, status) |
| **Domain Grouping** | Combined (with Green Belt) | Standalone |
| **Rule Granularity** | Aggregate distance rules | Individual development rules |
| **Risk Factors** | Distance only | Distance + Development Status |
| **Maximum Risk** | EXTREMELY_HIGH_RISK | SHOWSTOPPER |
| **Rule Count** | 8 fixed rules | Variable (1 per development) |
| **Frontend Display** | Simple list | Rich cards with icons/badges |

### Validation Summary ✅

The renewables implementation **perfectly follows the core architectural pattern** while demonstrating the system's **flexibility for domain-specific requirements**:

1. ✅ **SQL Layer:** Spatial analysis with standard distance buckets
2. ✅ **Risk Levels:** Uses centralized `RISK_LEVELS` constants  
3. ✅ **Business Rules:** Processes SQL results with planning logic
4. ✅ **Server Integration:** Standard endpoint with rule processing
5. ✅ **Frontend Display:** Structured report generation

**Key Innovation:** Shows how the standard distance-based pattern can be **enhanced with domain-specific logic** (status-based risk, per-item rules, complex filtering) while maintaining architectural consistency.

This confirms the system architecture is both **standardized and flexible** - perfect for scaling to new planning domains while maintaining consistency.
