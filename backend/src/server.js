import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { 
  buildAnalysisQuery, 
  buildHeritageAnalysisQuery, 
  buildListedBuildingsQuery, 
  buildConservationAreasQuery,
  buildLandscapeAnalysisQuery
} from './queries.js';
// Use rich, UI-aligned rules on the server
import { processHeritageRules } from './rules/heritageRulesRich.js';
import { processLandscapeRules } from './rules/landscapeRulesRich.js';

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

    // Compute landscape rules and overall risk on the server
    const rulesAssessment = processLandscapeRules(analysisResult);

    // Build enriched response for the frontend
    const response = {
      green_belt: analysisResult.green_belt || [],
      rules: rulesAssessment.rules || [],
      overallRisk: rulesAssessment.overallRisk || 0,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRulesProcessed: 2, // Green Belt rules count
        rulesTriggered: (rulesAssessment.rules || []).length,
        rulesVersion: 'landscape-rules-v1'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Landscape analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});


