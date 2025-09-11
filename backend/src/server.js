import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { 
  buildAnalysisQuery, 
  buildHeritageAnalysisQuery, 
  buildListedBuildingsQuery, 
  buildConservationAreasQuery,
  buildLandscapeAnalysisQuery,
  buildAgLandAnalysisQuery,
  buildRenewablesAnalysisQuery
} from './queries.js';
// Use rich, UI-aligned rules on the server
import { processHeritageRules } from './rules/heritage/index.js';
import { processLandscapeRules } from './rules/landscape/index.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
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

    // Compute heritage rules and overall risk on the server
    const rulesAssessment = processHeritageRules(analysisResult);

    // Build enriched response for the frontend
    const response = {
      listed_buildings: analysisResult.listed_buildings || [],
      conservation_areas: analysisResult.conservation_areas || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || 0,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRulesProcessed: 4, // number of rule families evaluated
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: 'heritage-rules-v1'
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

    // Return raw data (no rules processing for now - just display in ribbon)
    const response = {
      ag_land: analysisResult.ag_land || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'provisional_alc',
        analysisType: 'agricultural-land-classification'
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

    // Return raw data (no rules processing for now - just display in ribbon)
    const response = {
      renewables: analysisResult.renewables || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'Renewable Energy developments Q1 2025',
        analysisType: 'renewable-energy-developments',
        technologyFilter: ['Solar Photovoltaics', 'Wind Onshore', 'Battery']
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

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});


