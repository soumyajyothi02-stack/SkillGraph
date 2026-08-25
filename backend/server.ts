import express, { Request, Response } from 'express';
import { checkConnectivity } from './db.js';

export const app = express();

app.use(express.json());

/**
 * GET /api/health
 * Health check endpoint that verifies database connectivity via CognoDB.
 * Returns:
 *   - 200 OK with { "database": "CognoDB", "connected": true } on success
 *   - 503 Service Unavailable with { "database": "CognoDB", "connected": false } on failure
 * Prevents leaking database credentials or internal stack traces.
 */
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const health = await checkConnectivity();

    if (health.connected) {
      return res.status(200).json({
        database: 'CognoDB',
        connected: true,
      });
    }

    return res.status(503).json({
      database: 'CognoDB',
      connected: false,
    });
  } catch (err: unknown) {
    const rawError = err instanceof Error ? err.message : String(err);
    console.error('[CognoDB Health Check Error]:', rawError);

    return res.status(503).json({
      database: 'CognoDB',
      connected: false,
    });
  }
});

export default app;
