import { Router, Request, Response } from 'express';
import { executeCypher, verifyConnection } from '../db.js';

export const queryRouter = Router();

// POST /api/query - Execute custom Cypher query safely
queryRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { query, params = {} } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required.' });
    }

    const conn = await verifyConnection();
    if (!conn.connected) {
      return res.status(503).json({
        error: 'CognoDB is not currently connected via Bolt protocol.',
        message: conn.message,
      });
    }

    const result = await executeCypher(query, params);
    res.json(result);
  } catch (err: any) {
    console.error('Error in POST /api/query:', err);
    res.status(500).json({
      error: 'Query execution failed.',
      message: err.message,
    });
  }
});
