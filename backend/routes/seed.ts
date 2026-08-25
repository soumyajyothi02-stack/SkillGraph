import { Router, Request, Response } from 'express';
import { seedDatabase } from '../seed/seed.js';

export const seedRouter = Router();

// POST /api/seed - trigger database seed
seedRouter.post('/', async (req: Request, res: Response) => {
  try {
    const result = await seedDatabase();
    res.json(result);
  } catch (err: any) {
    console.error('Error in POST /api/seed:', err);
    res.status(500).json({
      success: false,
      error: 'Unable to seed the SkillGraph database.',
      message: err.message,
    });
  }
});
