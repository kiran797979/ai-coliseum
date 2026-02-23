import { Router, type Request, type Response } from 'express';
import type { HealthStatus } from '../types/index.js';
import { getDatabase } from '../db/database.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const dbHealthy = checkDatabase();
  
  const health: HealthStatus = {
    status: dbHealthy ? 'ok' : 'degraded',
    timestamp: Date.now(),
    uptime: process.uptime(),
    database: dbHealthy,
    blockchain: true,
  };

  res.status(dbHealthy ? 200 : 503).json(health);
});

router.get('/ready', (_req: Request, res: Response) => {
  if (checkDatabase()) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

function checkDatabase(): boolean {
  try {
    const db = getDatabase();
    db.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}

export default router;
