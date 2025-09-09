import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { 
  buildAnalysisQuery, 
  buildHeritageAnalysisQuery, 
  buildListedBuildingsQuery, 
  buildConservationAreasQuery,
  buildGreenBeltQuery,
  buildAONBQuery,
  buildMultiLayerQueries,
  enhanceWithRiskAssessment
} from './queries.js';

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
    res.json(analysisResult);
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

// Green Belt analysis endpoint
app.post('/analyze/green-belt', async (req, res) => {
  try {
    const { polygon } = req.body;
    if (!polygon) {
      return res.status(400).json({ error: 'polygon is required (GeoJSON Polygon or MultiPolygon)' });
    }

    const { text, values } = buildGreenBeltQuery(polygon);
    const result = await pool.query(text, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Green Belt analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Temporary endpoint to list database tables
app.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing tables:', error);
    res.status(500).json({ error: 'Failed to list tables' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

// Multi-layer analysis endpoint
app.post('/analyze/multi', async (req, res) => {
  try {
    const { polygon, layers } = req.body || {};
    if (!polygon || !Array.isArray(layers) || layers.length === 0) {
      return res.status(400).json({ error: 'polygon and non-empty layers[] are required' });
    }

    // Build queries for requested layers
    const queries = buildMultiLayerQueries(polygon, layers);
    if (queries.length === 0) {
      return res.status(400).json({ error: 'No valid layers requested' });
    }

    // Execute in parallel
    const results = await Promise.allSettled(
      queries.map(({ key, builder }) =>
        pool.query(builder.text, builder.values).then((r) => ({ key, rows: r.rows }))
      )
    );

    // Assemble response
    const payload = { };
    const errors = { };
    for (const r of results) {
      if (r.status === 'fulfilled') {
        const { key, rows } = r.value;
        // JSON-returning functions should expose a single row with column `result` or `analysis_result`
        const item = rows?.[0]?.result ?? rows?.[0]?.analysis_result ?? rows ?? null;
        payload[key] = item;
      } else {
        // When rejected, Promise.reason is on r.reason
        const key = queries[results.indexOf(r)]?.key || 'unknown';
        errors[key] = r.reason?.message || String(r.reason);
      }
    }

    if (Object.keys(errors).length > 0) payload.errors = errors;
    res.json(payload);
  } catch (error) {
    console.error('Multi-layer analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint for enhanced analysis with risk assessment
app.post('/analyze/enhanced', async (req, res) => {
  try {
    const { polygon } = req.body;
    
    if (!polygon) {
      return res.status(400).json({ error: 'Missing polygon data' });
    }
    
    // For now, we'll do heritage analysis + AONB as a demo
    // This will be expanded to include all layers
    const heritageQuery = buildHeritageAnalysisQuery(polygon);
    const aonbQuery = buildAONBQuery(polygon);
    const greenBeltQuery = buildGreenBeltQuery(polygon);
    
    // Execute all queries in parallel
    const [heritageResult, aonbResult, greenBeltResult] = await Promise.all([
      pool.query(heritageQuery.text, heritageQuery.values),
      pool.query(aonbQuery.text, aonbQuery.values),
      pool.query(greenBeltQuery.text, greenBeltQuery.values)
    ]);
    
    // Combine spatial data
    const spatialData = {
      heritage: heritageResult.rows[0]?.analysis_result || {},
      aonb: aonbResult.rows[0]?.result || null,
      green_belt: greenBeltResult.rows || []
    };
    
    // Enhance with risk assessment
    const enhancedResult = await enhanceWithRiskAssessment(spatialData);
    
    res.json(enhancedResult);
  } catch (error) {
    console.error('Enhanced analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


