import { config } from '../config.js';
import type { Agent, AIBattleResult } from '../types/index.js';

interface AIMove {
  agentId: number;
  action: string;
  damage: number;
  description: string;
}

export async function generateAIMove(agent: Agent, opponent: Agent): Promise<AIMove> {
  const actions = [
    { action: 'attack', baseDamage: 15 },
    { action: 'special', baseDamage: 25 },
    { action: 'defend', baseDamage: 0 },
    { action: 'counter', baseDamage: 10 },
  ];

  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  
  const skillBonus = agent.wins > 0 ? Math.min(agent.wins * 2, 10) : 0;
  const damage = randomAction.action === 'defend' 
    ? 0 
    : randomAction.baseDamage + Math.floor(Math.random() * 10) + skillBonus;

  const descriptions: Record<string, string[]> = {
    attack: [
      `${agent.name} strikes ${opponent.name} with precision!`,
      `${agent.name} lands a solid hit on ${opponent.name}!`,
      `${agent.name} delivers a powerful blow to ${opponent.name}!`,
    ],
    special: [
      `${agent.name} unleashes a devastating special attack on ${opponent.name}!`,
      `${agent.name} channels energy and blasts ${opponent.name}!`,
      `${agent.name} executes a critical strike against ${opponent.name}!`,
    ],
    defend: [
      `${agent.name} raises their guard and braces for impact!`,
      `${agent.name} takes a defensive stance!`,
      `${agent.name} prepares to counter the next attack!`,
    ],
    counter: [
      `${agent.name} deflects and lands a quick counter on ${opponent.name}!`,
      `${agent.name} parries and strikes back at ${opponent.name}!`,
      `${agent.name} turns defense into offense against ${opponent.name}!`,
    ],
  };

  const actionDescriptions = descriptions[randomAction.action];
  const description = actionDescriptions[Math.floor(Math.random() * actionDescriptions.length)];

  return {
    agentId: agent.id,
    action: randomAction.action,
    damage,
    description,
  };
}

export async function simulateBattle(agentA: Agent, agentB: Agent): Promise<AIBattleResult> {
  const battleLog: string[] = [];
  battleLog.push(`⚔️ Battle begins: ${agentA.name} vs ${agentB.name}!`);
  battleLog.push(`---`);

  let healthA = 100;
  let healthB = 100;
  const maxRounds = 20;
  let round = 0;

  while (healthA > 0 && healthB > 0 && round < maxRounds) {
    round++;
    battleLog.push(`Round ${round}:`);

    const attackerFirst = Math.random() > 0.5;
    const [first, second] = attackerFirst ? [agentA, agentB] : [agentB, agentA];
    let [healthFirst, healthSecond] = attackerFirst ? [healthA, healthB] : [healthB, healthA];

    const move1 = await generateAIMove(first, second);
    battleLog.push(`  ${move1.description} (${move1.damage} damage)`);
    
    if (move1.damage > 0) {
      healthSecond -= move1.damage;
      battleLog.push(`  ${second.name} health: ${Math.max(0, healthSecond)}/100`);
    }

    if (healthSecond <= 0) break;

    const move2 = await generateAIMove(second, first);
    battleLog.push(`  ${move2.description} (${move2.damage} damage)`);
    
    if (move2.damage > 0) {
      healthFirst -= move2.damage;
      battleLog.push(`  ${first.name} health: ${Math.max(0, healthFirst)}/100`);
    }

    [healthA, healthB] = attackerFirst ? [healthFirst, healthSecond] : [healthSecond, healthFirst];

    battleLog.push(`---`);
  }

  let winnerId: number;
  let loserId: number;
  let winnerName: string;

  if (healthA <= 0) {
    winnerId = agentB.id;
    loserId = agentA.id;
    winnerName = agentB.name;
  } else if (healthB <= 0) {
    winnerId = agentA.id;
    loserId = agentB.id;
    winnerName = agentA.name;
  } else {
    winnerId = healthA > healthB ? agentA.id : agentB.id;
    loserId = healthA > healthB ? agentB.id : agentA.id;
    winnerName = healthA > healthB ? agentA.name : agentB.name;
  }

  battleLog.push(`🏆 ${winnerName} emerges victorious!`);

  return {
    winnerId,
    loserId,
    reasoning: `Battle concluded after ${round} rounds. Winner determined by remaining health.`,
    battleLog,
  };
}

export async function callExternalAI(prompt: string): Promise<string> {
  if (!config.aiApiKey) {
    throw new Error('AI API key not configured');
  }

  return prompt;
}
