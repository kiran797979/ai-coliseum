import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { dbOperations } from '../db/database.js';
import type { Agent, ApiResponse } from '../types/index.js';

const router = Router();

const createAgentSchema = z.object({
  name: z.string().min(1).max(32),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  metadataURI: z.string().url().optional(),
});

router.get('/', (_req: Request, res: Response) => {
  const agents = dbOperations.getAllAgents();
  res.json({ success: true, data: agents });
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid agent ID' });
    return;
  }

  const agent = dbOperations.getAgent(id);
  
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found' });
    return;
  }

  res.json({ success: true, data: agent });
});

router.post('/', (req: Request, res: Response) => {
  const parseResult = createAgentSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: parseResult.error.issues 
    });
    return;
  }

  const { name, owner, metadataURI } = parseResult.data;

  const agentId = dbOperations.createAgent({
    name,
    owner,
    metadataURI: metadataURI || '',
    wins: 0,
    losses: 0,
    totalBattles: 0,
    stakedAmount: '0',
    isActive: true,
  });

  const agent = dbOperations.getAgent(agentId);
  res.status(201).json({ success: true, data: agent });
});

router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid agent ID' });
    return;
  }

  const agent = dbOperations.getAgent(id);
  
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found' });
    return;
  }

  const updateSchema = z.object({
    isActive: z.boolean().optional(),
    metadataURI: z.string().url().optional(),
  });

  const parseResult = updateSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: parseResult.error.issues 
    });
    return;
  }

  const updatedAgent = dbOperations.getAgent(id);
  res.json({ success: true, data: updatedAgent });
});

router.get('/:id/stats', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid agent ID' });
    return;
  }

  const agent = dbOperations.getAgent(id);
  
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found' });
    return;
  }

  const winRate = agent.totalBattles > 0 
    ? (agent.wins / agent.totalBattles) * 100 
    : 0;

  res.json({
    success: true,
    data: {
      wins: agent.wins,
      losses: agent.losses,
      totalBattles: agent.totalBattles,
      winRate: winRate.toFixed(2),
    },
  });
});

export default router;
