import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { pool } from './db.js';
import {
  buildAnalysisQuery,
  buildHeritageAnalysisQuery,
  buildListedBuildingsQuery,
  buildConservationAreasQuery,
  buildScheduledMonumentsQuery,
  buildLandscapeAnalysisQuery,
  buildAgLandAnalysisQuery,
  buildRenewablesAnalysisQuery,
  buildEcologyAnalysisQuery
} from './queries.js';
// Use rich, UI-aligned rules on the server
import { processHeritageRules } from './rules/heritage/index.js';
import { processLandscapeRules } from './rules/landscape/index.js';
import { processRenewablesRules } from './rules/renewables/index.js';
import { processEcologyRules } from './rules/ecology/index.js';
import { processAgLandRules } from './rules/agland/agLandRulesRich.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Legacy analyze endpoint (for backward compatibility)
app.post('/analyze', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildAnalysisQuery(polygon);
    const result = await pool.query(text, values);
    res.json(result.rows[0] ?? {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New detailed heritage analysis endpoint
app.post('/analyze/heritage', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildHeritageAnalysisQuery(polygon);
    const result = await pool.query(text, values);
    
    // Extract the JSON result from the PostgreSQL function
    const analysisResult = result.rows[0]?.analysis_result || {};

    // Debug: log heritage data to verify data flow
    try {
      const listedBuildingsArr = Array.isArray(analysisResult.listed_buildings) ? analysisResult.listed_buildings : [];
      const conservationAreasArr = Array.isArray(analysisResult.conservation_areas) ? analysisResult.conservation_areas : [];
      const scheduledMonumentsArr = Array.isArray(analysisResult.scheduled_monuments) ? analysisResult.scheduled_monuments : [];
      console.log('[Heritage] listed_buildings count:', listedBuildingsArr.length, 'on_site:', listedBuildingsArr.filter(lb => lb?.on_site).length);
      console.log('[Heritage] conservation_areas count:', conservationAreasArr.length, 'on_site:', conservationAreasArr.filter(ca => ca?.on_site).length);
      console.log('[Heritage] scheduled_monuments count:', scheduledMonumentsArr.length, 'on_site:', scheduledMonumentsArr.filter(sm => sm?.on_site).length, 'within_5km:', scheduledMonumentsArr.filter(sm => sm?.within_5km).length);
    } catch {}

    // Compute heritage rules and overall risk on the server
    const rulesAssessment = processHeritageRules(analysisResult);

    // Build enriched response for the frontend
    const response = {
      listed_buildings: analysisResult.listed_buildings || [],
      conservation_areas: analysisResult.conservation_areas || [],
      scheduled_monuments: analysisResult.scheduled_monuments || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || 0,
      defaultTriggeredRecommendations: rulesAssessment.defaultTriggeredRecommendations || [],
      defaultNoRulesRecommendations: rulesAssessment.defaultNoRulesRecommendations || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRulesProcessed: 12, // 2 Listed Buildings + 2 Conservation Areas + 8 Scheduled Monuments rule checks
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: 'heritage-rules-v2'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Heritage analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listed buildings analysis endpoint
app.post('/analyze/listed-buildings', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildListedBuildingsQuery(polygon);
    const result = await pool.query(text, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Listed buildings analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Conservation areas analysis endpoint
app.post('/analyze/conservation-areas', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildConservationAreasQuery(polygon);
    const result = await pool.query(text, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Conservation areas analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scheduled monuments analysis endpoint
app.post('/analyze/scheduled-monuments', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }
    const { text, values } = buildScheduledMonumentsQuery(polygon);
    const result = await pool.query(text, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Scheduled monuments analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landscape analysis endpoint
app.post('/analyze/landscape', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildLandscapeAnalysisQuery(polygon);
    const result = await pool.query(text, values);
    
    // Extract the JSON result from the PostgreSQL function
    const analysisResult = result.rows[0]?.analysis_result || {};

    // Debug: log landscape layer counts to verify data flow
    try {
      const gbArr = Array.isArray(analysisResult.green_belt) ? analysisResult.green_belt : [];
      const aonbArr = Array.isArray(analysisResult.aonb) ? analysisResult.aonb : [];
      console.log('[Landscape] green_belt count:', gbArr.length, 'on_site:', gbArr.filter((x) => x?.on_site).length, 'within_1km:', gbArr.filter((x) => x?.within_1km).length);
      console.log('[Landscape] aonb count:', aonbArr.length, 'on_site:', aonbArr.filter((x) => x?.on_site).length, 'within_1km:', aonbArr.filter((x) => x?.within_1km).length);
    } catch {}

    // Compute landscape rules and overall risk on the server
    const rulesAssessment = processLandscapeRules(analysisResult);

    // Build enriched response for the frontend
    const response = {
      green_belt: analysisResult.green_belt || [],
      aonb: analysisResult.aonb || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || 0,
      defaultTriggeredRecommendations: rulesAssessment.defaultTriggeredRecommendations || [],
      defaultNoRulesRecommendations: rulesAssessment.defaultNoRulesRecommendations || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRulesProcessed: 10, // 2 Green Belt + 8 AONB rule checks
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: 'landscape-rules-v2'
      }
    };

    res.json(response);
  } catch (error) {
    // Log detailed Postgres error information when available
    console.error('Landscape analysis error:', {
      message: error?.message,
      detail: error?.detail,
      hint: error?.hint,
      position: error?.position,
      stack: error?.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Agricultural land analysis endpoint
app.post('/analyze/ag-land', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildAgLandAnalysisQuery(polygon);
    const result = await pool.query(text, values);
    
    // Extract the JSON result from the PostgreSQL function
    const analysisResult = result.rows[0]?.analysis_result || {};

    // Debug: log ag land data to verify data flow
    try {
      const agLandArr = Array.isArray(analysisResult.ag_land) ? analysisResult.ag_land : [];
      console.log('[AgLand] ag_land count:', agLandArr.length, 'grades found:', agLandArr.map(a => a.grade).join(', '));
    } catch {}

    // Compute agricultural land rules and overall risk on the server
    const rulesAssessment = processAgLandRules(analysisResult);

    // Build enriched response for the frontend
    const response = {
      ag_land: analysisResult.ag_land || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || 0,
      defaultTriggeredRecommendations: rulesAssessment.defaultTriggeredRecommendations || [],
      defaultNoRulesRecommendations: rulesAssessment.defaultNoRulesRecommendations || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'provisional_alc',
        analysisType: 'agricultural-land-classification',
        totalRulesProcessed: rulesAssessment.metadata?.totalRulesProcessed || 0,
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: rulesAssessment.metadata?.rulesVersion || 'agland-rules-v1'
      }
    };

    res.json(response);
  } catch (error) {
    // Log detailed Postgres error information when available
    console.error('Agricultural land analysis error:', {
      message: error?.message,
      detail: error?.detail,
      hint: error?.hint,
      position: error?.position,
      stack: error?.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Renewables analysis endpoint
app.post('/analyze/renewables', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildRenewablesAnalysisQuery(polygon);
    const result = await pool.query(text, values);
    
    // Extract the JSON result from the PostgreSQL function
    const analysisResult = result.rows[0]?.analysis_result || {};

    // Debug: log renewables data to verify data flow
    try {
      const renewablesArr = Array.isArray(analysisResult.renewables) ? analysisResult.renewables : [];
      console.log('[Renewables] count:', renewablesArr.length, 'on_site:', renewablesArr.filter(r => r?.on_site).length, 'tech types:', [...new Set(renewablesArr.map(r => r.technology_type))].join(', '));
    } catch {}

    // Compute renewables rules and overall risk on the server
    const rulesAssessment = processRenewablesRules(analysisResult);

    // Build enriched response for the frontend
    const response = {
      renewables: analysisResult.renewables || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || null,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'Renewable Energy developments Q1 2025',
        analysisType: 'renewable-energy-developments',
        technologyFilter: ['Solar Photovoltaics'],
        capacityFilter: '> 10 MW',
        totalRulesProcessed: rulesAssessment.metadata?.totalRulesProcessed || 0,
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: rulesAssessment.metadata?.rulesVersion || 'renewables-rules-v1'
      }
    };

    res.json(response);
  } catch (error) {
    // Log detailed Postgres error information when available
    console.error('Renewables analysis error:', {
      message: error?.message,
      detail: error?.detail,
      hint: error?.hint,
      position: error?.position,
      stack: error?.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ecology analysis endpoint
app.post('/analyze/ecology', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildEcologyAnalysisQuery(polygon);
    const result = await pool.query(text, values);
    
    // Extract the JSON result from the PostgreSQL function
    const analysisResult = result.rows[0]?.analysis_result || {};

    // Debug: log ecology data to verify data flow
    try {
      const pondsArr = Array.isArray(analysisResult.os_priority_ponds) ? analysisResult.os_priority_ponds : [];
      const ramsarArr = Array.isArray(analysisResult.ramsar) ? analysisResult.ramsar : [];
      const gcnArr = Array.isArray(analysisResult.gcn) ? analysisResult.gcn : [];
      console.log('[Ecology] os_priority_ponds count:', pondsArr.length, 'on_site:', pondsArr.filter(p => p?.on_site).length, 'within_250m:', pondsArr.filter(p => p?.within_250m).length);
      console.log('[Ecology] ramsar count:', ramsarArr.length, 'on_site:', ramsarArr.filter(r => r?.on_site).length, 'within_5km:', ramsarArr.filter(r => r?.within_5km).length);
      console.log('[Ecology] gcn count:', gcnArr.length, 'on_site:', gcnArr.filter(g => g?.on_site).length, 'within_250m:', gcnArr.filter(g => g?.within_250m).length);
    } catch {}

    // Compute ecology rules and overall risk on the server
    const rulesAssessment = processEcologyRules(analysisResult);

    // Build enriched response for the frontend
    const response = {
      os_priority_ponds: analysisResult.os_priority_ponds || [],
      ramsar: analysisResult.ramsar || [],
      gcn: analysisResult.gcn || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || 0,
      defaultTriggeredRecommendations: rulesAssessment.defaultTriggeredRecommendations || [],
      defaultNoRulesRecommendations: rulesAssessment.defaultNoRulesRecommendations || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRulesProcessed: 12, // 2 OS Priority Ponds + 8 Ramsar + 2 GCN rule checks
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: 'ecology-rules-v3'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Ecology analysis error:', {
      message: error?.message,
      detail: error?.detail,
      hint: error?.hint,
      position: error?.position,
      stack: error?.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save site analysis for TRP Report endpoint
app.post('/save-site', async (req, res) => {
  try {
    const {
      siteName,
      polygonGeojson,
      heritageRisk,
      heritageRuleCount,
      landscapeRisk,
      landscapeRuleCount,
      renewablesRisk,
      renewablesRuleCount,
      ecologyRisk,
      ecologyRuleCount,
      agLandRisk,
      agLandRuleCount
    } = req.body;

    if (!siteName || !polygonGeojson) {
      return res.status(400).json({ error: 'siteName and polygonGeojson are required' });
    }

    // Generate unique ID for the site
    const uniqueId = crypto.randomUUID();

    // Insert site analysis with streamlined rule data
    const insertSiteQuery = `
      INSERT INTO site_analyses (
        unique_id, site_name, polygon_geojson,
        heritage_data, landscape_data, renewables_data, ecology_data, ag_land_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, unique_id;
    `;

    // Store only risk levels and rule counts - minimal data for TRP reports
    const siteResult = await pool.query(insertSiteQuery, [
      uniqueId,
      siteName,
      JSON.stringify(polygonGeojson),
      JSON.stringify({ riskLevel: heritageRisk, ruleCount: heritageRuleCount }),
      JSON.stringify({ riskLevel: landscapeRisk, ruleCount: landscapeRuleCount }),
      JSON.stringify({ riskLevel: renewablesRisk, ruleCount: renewablesRuleCount }),
      JSON.stringify({ riskLevel: ecologyRisk, ruleCount: ecologyRuleCount }),
      JSON.stringify({ riskLevel: agLandRisk, ruleCount: agLandRuleCount })
    ]);

    const siteAnalysisId = siteResult.rows[0].id;

    // Create initial TRP report record
    const insertTrpQuery = `
      INSERT INTO trp_reports (site_analysis_id, site_summary, overall_risk_estimation)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    const trpResult = await pool.query(insertTrpQuery, [
      siteAnalysisId,
      '', // Empty initial site summary
      '' // Empty initial overall risk estimation
    ]);

    console.log(`✅ Site saved: ${siteName} (${uniqueId})`);

    res.json({
      success: true,
      siteId: uniqueId,
      trpReportId: trpResult.rows[0].id,
      message: 'Site analysis saved successfully'
    });

  } catch (error) {
    console.error('Save site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save TRP report edits
app.post('/save-trp-edits', async (req, res) => {
  try {
    const { report, lastModified } = req.body;

    if (!report) {
      return res.status(400).json({ error: 'Report data is required' });
    }

    console.log('💾 Saving TRP edits...');

    // For now, we'll just log the data and return success
    // In a full implementation, you would:
    // 1. Validate the report structure
    // 2. Update the database with edited risk levels and recommendations
    // 3. Store edit history/audit trail
    // 4. Associate with the original site analysis

    console.log('📊 TRP Report edits received:', {
      structuredReport: !!report.structuredReport,
      disciplines: report.structuredReport?.disciplines?.length || 0,
      lastModified
    });

    // Return success response
    res.json({
      success: true,
      message: 'TRP edits saved successfully',
      editId: crypto.randomUUID(),
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error saving TRP edits:', error);
    res.status(500).json({ error: 'Failed to save TRP edits', details: error.message });
  }
});

// Socioeconomics analysis - separate import to keep modular
import {
  getSocioeconomicsQueries,
  getGeoIdentifiers
} from './socioeconomicsQueries.js';

// Socioeconomics analysis endpoint
app.post('/analyze/socioeconomics', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    console.log('🔍 Starting socioeconomics analysis...');

    // Get all socioeconomics queries
    const queries = getSocioeconomicsQueries(polygon);
    const results = {};

    // Execute each query and collect results
    for (const { name, query } of queries) {
      try {
        console.log(`📊 Running ${name} query...`);
        const result = await pool.query(query.text, query.values);

        // Process each row - include all fields plus geo identifiers
        const processedRows = result.rows.map((row, index) => {
          const geoIds = getGeoIdentifiers(name, row);
          return {
            ...row,
            ...geoIds,
            layer_type: name,
            feature_index: index + 1
          };
        });

        results[name.toLowerCase()] = processedRows;
        console.log(`✅ ${name}: ${processedRows.length} features found`);
      } catch (error) {
        console.error(`❌ Error querying ${name}:`, error.message);
        results[name.toLowerCase()] = [];
      }
    }

    // Build response
    const response = {
      ...results,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalLayers: queries.length,
        layersWithData: Object.values(results).filter(layer => layer.length > 0).length,
        analysisType: 'socioeconomic-spatial-analysis'
      }
    };

    console.log('🎉 Socioeconomics analysis complete!');
    res.json(response);

  } catch (error) {
    console.error('Socioeconomics analysis error:', {
      message: error?.message,
      detail: error?.detail,
      hint: error?.hint,
      stack: error?.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});


