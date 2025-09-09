import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { 
  buildAnalysisQuery, 
  buildHeritageAnalysisQuery, 
  buildListedBuildingsQuery, 
  buildConservationAreasQuery,
  buildGreenBeltQuery
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


