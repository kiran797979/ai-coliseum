import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { dbOperations } from '../db/database.js';

const router = Router();

const placeBetSchema = z.object({
  bettor: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  agentId: z.number().int().positive(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
});

router.get('/', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const markets = dbOperations.getAllMarkets(status);
  res.json({ success: true, data: markets });
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid market ID' });
    return;
  }

  const market = dbOperations.getMarket(id);
  
  if (!market) {
    res.status(404).json({ success: false, error: 'Market not found' });
    return;
  }

  res.json({ success: true, data: market });
});

router.get('/:id/odds', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid market ID' });
    return;
  }

  const market = dbOperations.getMarket(id);
  
  if (!market) {
    res.status(404).json({ success: false, error: 'Market not found' });
    return;
  }

  const poolA = parseFloat(market.totalPoolA);
  const poolB = parseFloat(market.totalPoolB);
  const total = poolA + poolB;

  let oddsA = 0.5;
  let oddsB = 0.5;

  if (total > 0) {
    oddsA = poolA / total;
    oddsB = poolB / total;
  }

  res.json({
    success: true,
    data: {
      agentA: market.agentA,
      agentB: market.agentB,
      oddsA: oddsA.toFixed(4),
      oddsB: oddsB.toFixed(4),
      totalPoolA: market.totalPoolA,
      totalPoolB: market.totalPoolB,
      totalPool: total.toString(),
    },
  });
});

router.post('/:id/bet', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid market ID' });
    return;
  }

  const market = dbOperations.getMarket(id);
  
  if (!market) {
    res.status(404).json({ success: false, error: 'Market not found' });
    return;
  }

  if (market.status !== 'open') {
    res.status(400).json({ success: false, error: 'Market is not open for betting' });
    return;
  }

  const parseResult = placeBetSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: parseResult.error.issues 
    });
    return;
  }

  const { bettor, agentId, amount } = parseResult.data;

  if (agentId !== market.agentA && agentId !== market.agentB) {
    res.status(400).json({ success: false, error: 'Invalid agent for this market' });
    return;
  }

  const betId = dbOperations.createBet({
    marketId: id,
    bettor,
    agentId,
    amount,
    claimed: false,
  });

  const currentPoolA = parseFloat(market.totalPoolA);
  const currentPoolB = parseFloat(market.totalPoolB);
  const betAmount = parseFloat(amount);

  if (agentId === market.agentA) {
    dbOperations.updateMarketPool(id, (currentPoolA + betAmount).toString(), market.totalPoolB);
  } else {
    dbOperations.updateMarketPool(id, market.totalPoolA, (currentPoolB + betAmount).toString());
  }

  res.status(201).json({ 
    success: true, 
    data: { 
      betId,
      marketId: id,
      agentId,
      amount,
    } 
  });
});

router.get('/:id/bets', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid market ID' });
    return;
  }

  const market = dbOperations.getMarket(id);
  
  if (!market) {
    res.status(404).json({ success: false, error: 'Market not found' });
    return;
  }

  const bets = dbOperations.getBetsByMarket(id);
  res.json({ success: true, data: bets });
});

router.post('/:id/resolve', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid market ID' });
    return;
  }

  const resolveSchema = z.object({
    winner: z.number().int().positive(),
  });

  const parseResult = resolveSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: parseResult.error.issues 
    });
    return;
  }

  const market = dbOperations.getMarket(id);
  
  if (!market) {
    res.status(404).json({ success: false, error: 'Market not found' });
    return;
  }

  if (market.status !== 'open') {
    res.status(400).json({ success: false, error: 'Market already resolved or closed' });
    return;
  }

  const { winner } = parseResult.data;

  if (winner !== market.agentA && winner !== market.agentB) {
    res.status(400).json({ success: false, error: 'Invalid winner for this market' });
    return;
  }

  dbOperations.resolveMarket(id, winner);
  
  const updatedMarket = dbOperations.getMarket(id);
  res.json({ success: true, data: updatedMarket });
});

export default router;
