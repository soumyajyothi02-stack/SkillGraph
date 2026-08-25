import { Router, Request, Response } from 'express';
import { GraphService } from '../graphService.js';

export const technologiesRouter = Router();

// GET /api/technologies - list all technologies with optional filters
technologiesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await GraphService.getTechnologies(type, search);
    res.json(result);
  } catch (err: any) {
    console.error('Error in GET /api/technologies:', err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// GET /api/technologies/:name - get technology details with connections
technologiesRouter.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const result = await GraphService.getTechnologyByName(name);
    if (!result.data) {
      return res.status(404).json({ error: `Technology "${name}" not found in graph.` });
    }
    res.json(result);
  } catch (err: any) {
    console.error(`Error in GET /api/technologies/${req.params.name}:`, err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});
