// api/index.ts

import express from 'express';
// Note the updated path to the orchestrator
import { runFullAnalysis } from './src/orchestrator.js'; 
import 'dotenv/config';

const app = express();

app.use(express.json());

// Middleware for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// The Main Analysis Endpoint
app.get('/api/analyze', async (req, res) => {
  const domain = req.query.domain as string;
  console.log(`[Server] Received analysis request for: ${domain}`);

  if (!domain) {
    return res.status(400).json({ error: 'The "domain" query parameter is required.' });
  }

  try {
    const finalReport = await runFullAnalysis(domain);
    if (finalReport) {
      return res.status(200).json(finalReport);
    } else {
      return res.status(500).json({ error: 'The analysis failed. Check server logs.' });
    }
  } catch (error) {
    console.error(`[Server] Critical error for ${domain}:`, error);
    return res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Vercel exports the app
export default app;