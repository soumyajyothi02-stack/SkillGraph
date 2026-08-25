import { Router, Request, Response } from 'express';
import { GraphService } from '../graphService.js';

export const companiesRouter = Router();

// GET /api/companies - list all companies with optional filters
companiesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const industry = req.query.industry as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await GraphService.getCompanies(industry, search);
    res.json(result);
  } catch (err: any) {
    console.error('Error in GET /api/companies:', err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});

// GET /api/companies/:name - get company profile with hiring roles & tech stack
companiesRouter.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const result = await GraphService.getCompanyByName(name);
    if (!result.data) {
      return res.status(404).json({ error: `Company "${name}" not found in graph.` });
    }
    res.json(result);
  } catch (err: any) {
    console.error(`Error in GET /api/companies/${req.params.name}:`, err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});
