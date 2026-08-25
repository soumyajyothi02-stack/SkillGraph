import { Router, Request, Response } from 'express';
import { GraphService } from '../graphService.js';

export const searchRouter = Router();

// GET /api/search - global multi-entity search
searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const results = await GraphService.globalSearch(q);
    res.json(results);
  } catch (err: any) {
    console.error('Error in GET /api/search:', err);
    res.status(500).json({
      error: 'Unable to perform search on the SkillGraph database.',
    });
  }
});
