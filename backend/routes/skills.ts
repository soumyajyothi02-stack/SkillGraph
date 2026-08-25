import { Router, Request, Response } from 'express';
import { GraphService } from '../graphService.js';

export const skillsRouter = Router();

// GET /api/skills - list all skills with optional filters
skillsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await GraphService.getSkills(category, search);
    res.json(result);
  } catch (err: any) {
    console.error('Error in GET /api/skills:', err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// GET /api/skills/:name - get skill profile with connections
skillsRouter.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const result = await GraphService.getSkillByName(name);
    if (!result.data) {
      return res.status(404).json({ error: `Skill "${name}" not found in graph.` });
    }
    res.json(result);
  } catch (err: any) {
    console.error(`Error in GET /api/skills/${req.params.name}:`, err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});
