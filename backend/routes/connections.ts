import { Router, Request, Response } from 'express';
import { GraphService } from '../graphService.js';

export const connectionsRouter = Router();

// GET /api/connections - multi-hop path traversal
connectionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const start = (req.query.start as string) || 'Python';
    const target = (req.query.target as string) || 'Google';

    const result = await GraphService.findConnections(start, target);
    res.json(result);
  } catch (err: any) {
    console.error('Error in GET /api/connections:', err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});
