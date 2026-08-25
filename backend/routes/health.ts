import { Router, Request, Response } from 'express';
import { checkConnectivity } from '../db.js';

export const healthRouter = Router();

/**
 * GET /api/health
 * Health check endpoint verifying CognoDB connectivity.
 * Response format: { "database": "CognoDB", "connected": boolean }
 * Returns HTTP 200 on success or HTTP 503 on connection failure,
 * adhering to security best practices by preventing sensitive information leakage.
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
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

