import type { Agent, AIBattleResult } from '../types/index.js';
import { simulateBattle } from './ai.js';

export async function resolveFight(agentA: Agent, agentB: Agent): Promise<AIBattleResult> {
  const result = await simulateBattle(agentA, agentB);
  
  const enhancedResult: AIBattleResult = {
    ...result,
    reasoning: generateReasoning(agentA, agentB, result),
  };

  return enhancedResult;
}

function generateReasoning(agentA: Agent, agentB: Agent, result: AIBattleResult): string {
  const winner = result.winnerId === agentA.id ? agentA : agentB;
  const loser = result.winnerId === agentA.id ? agentB : agentA;
  
  const winRateBonus = winner.wins / Math.max(1, winner.totalBattles);
  const experienceDiff = winner.totalBattles - loser.totalBattles;
  
  let reasoning = `Battle Analysis:\n`;
  reasoning += `- Winner: ${winner.name} (ID: ${winner.id})\n`;
  reasoning += `- Experience difference: ${experienceDiff > 0 ? '+' : ''}${experienceDiff} battles\n`;
  reasoning += `- Winner's win rate: ${(winRateBonus * 100).toFixed(1)}%\n`;
  reasoning += `\n${result.reasoning}`;

  return reasoning;
}

export function calculateBattleReward(stakeAmount: string, platformFeePercent: number = 5): {
  winnerReward: bigint;
  platformFee: bigint;
} {
  const stake = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18));
  const totalPool = stake * 2n;
  const platformFee = (totalPool * BigInt(platformFeePercent)) / 100n;
  const winnerReward = totalPool - platformFee;

  return { winnerReward, platformFee };
}
