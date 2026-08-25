import { Router, Request, Response } from 'express';
import { GraphService } from '../graphService.js';

export const graphRouter = Router();

// GET /api/graph - get full graph or filtered subgraphs
graphRouter.get('/', async (req: Request, res: Response) => {
  try {
    const typesParam = req.query.types as string | undefined;
    const search = req.query.search as string | undefined;
    const nodeTypes = typesParam ? typesParam.split(',').map((s) => s.trim()) : undefined;

    const result = await GraphService.getGraph(nodeTypes, search);
    res.json(result);
  } catch (err: any) {
    console.error('Error in GET /api/graph:', err);
    res.status(500).json({
      error: 'Unable to connect to the SkillGraph database. Please try again.',
    });
  }
});
