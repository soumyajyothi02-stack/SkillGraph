import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { verifyConnection } from './backend/db.js';
import { GraphService } from './backend/graphService.js';
import { seedDatabase } from './backend/seed/seed.js';
import { skillsRouter } from './backend/routes/skills.js';
import { technologiesRouter } from './backend/routes/technologies.js';
import { rolesRouter } from './backend/routes/roles.js';
import { companiesRouter } from './backend/routes/companies.js';
import { graphRouter } from './backend/routes/graph.js';
import { connectionsRouter } from './backend/routes/connections.js';
import { searchRouter } from './backend/routes/search.js';
import { seedRouter } from './backend/routes/seed.js';
import { queryRouter } from './backend/routes/query.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check & Database status
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const status = await GraphService.getStatus();
      res.json({
        database: 'CognoDB',
        connected: status.connected,
        appName: 'SkillGraph',
        ...status,
      });
    } catch (err: any) {
      res.status(500).json({
        database: 'CognoDB',
        connected: false,
        status: 'error',
        message: 'Unable to check database status.',
        error: err.message,
      });
    }
  });

  // Mount API Routers
  app.use('/api/skills', skillsRouter);
  app.use('/api/technologies', technologiesRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/companies', companiesRouter);
  app.use('/api/graph', graphRouter);
  app.use('/api/connections', connectionsRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/seed', seedRouter);
  app.use('/api/query', queryRouter);

  // Vite middleware in dev vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillGraph Server] listening on http://0.0.0.0:${PORT}`);

    // Auto-seed if database is empty on start
    verifyConnection().then(async (conn) => {
      if (conn.connected) {
        try {
          const status = await GraphService.getStatus();
          if (status.stats.skillsCount === 0) {
            console.log('[Server Startup] Graph is empty. Auto-seeding CognoDB...');
            await seedDatabase();
          }
        } catch (e) {
          console.warn('[Server Startup] Auto-seed check notice:', e);
        }
      }
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start SkillGraph server:', err);
  process.exit(1);
});
