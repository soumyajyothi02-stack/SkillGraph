import { Router, Request, Response } from 'express';
import { GraphService } from '../graphService.js';

export const rolesRouter = Router();

// GET /api/roles - list all job roles with optional filters
rolesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const experienceLevel = req.query.experienceLevel as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await GraphService.getJobRoles(experienceLevel, search);
    res.json(result);
  } catch (err: any) {
    console.error('Error in GET /api/roles:', err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});

// GET /api/roles/:title - get job role profile with required skills & hiring companies
rolesRouter.get('/:title', async (req: Request, res: Response) => {
  try {
    const { title } = req.params;
    const result = await GraphService.getJobRoleByTitle(title);
    if (!result.data) {
      return res.status(404).json({ error: `Job Role "${title}" not found in graph.` });
    }
    res.json(result);
  } catch (err: any) {
    console.error(`Error in GET /api/roles/${req.params.title}:`, err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});
