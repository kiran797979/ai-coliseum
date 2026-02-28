import { config } from '../config.js';
import type { Agent, AIBattleResult } from '../types/index.js';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/* ═══════════════════════════════════════════
   EPIC BATTLE PROMPT
   ═══════════════════════════════════════════ */
function buildBattlePrompt(agentA: Agent, agentB: Agent): string {
  return `You are the LEGENDARY NARRATOR of AI Coliseum — an epic on-chain battle arena where AI agents fight for glory and MON tokens.

═══ COMBATANTS ═══

🟣 AGENT A: "${agentA.name}" (ID: ${agentA.id})
   Record: ${agentA.wins}W / ${agentA.losses}L (${agentA.totalBattles} battles)
   ${agentA.wins > agentA.losses ? '⚡ Battle-hardened veteran' : agentA.totalBattles === 0 ? '🆕 Untested rookie' : '💪 Rising contender'}

🔵 AGENT B: "${agentB.name}" (ID: ${agentB.id})
   Record: ${agentB.wins}W / ${agentB.losses}L (${agentB.totalBattles} battles)
   ${agentB.wins > agentB.losses ? '⚡ Battle-hardened veteran' : agentB.totalBattles === 0 ? '🆕 Untested rookie' : '💪 Rising contender'}

═══ RULES ═══
- The battle has EXACTLY 5 rounds
- Each round: one agent attacks, the other defends/counters
- Include at least ONE critical hit (💥) and ONE dodge/evade
- The winner should feel EARNED, not random
- Factor in their win/loss records — experienced fighters have an edge
- Make it DRAMATIC and CINEMATIC

═══ RESPONSE FORMAT ═══
Respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "winnerId": ${agentA.id},
  "reasoning": "2-3 sentence analysis of why this agent won. Reference specific moments.",
  "battleLog": [
    "⚔️ ${agentA.name} vs ${agentB.name} — The crowd roars as both fighters enter the arena!",
    "--- Round 1 ---",
    "${agentA.name} opens with [attack description]...",
    "${agentB.name} [response]...",
    "[damage/effect line]",
    "--- Round 2 ---",
    "[continue narration]...",
    "--- Round 3 ---",
    "💥 CRITICAL HIT! [dramatic moment]...",
    "--- Round 4 ---",
    "[tension building]...",
    "--- Round 5 ---",
    "[climactic finish]...",
    "🏆 ${agentA.name} WINS! [victory description]"
  ]
}

IMPORTANT:
- winnerId MUST be either ${agentA.id} or ${agentB.id}
- battleLog should have 12-18 lines
- Make each round feel unique with different attacks and tactics
- Use vivid action words: "slashes", "dodges", "unleashes", "parries", "charges"
- The final line MUST start with "🏆" and name the winner`;
}

/* ═══════════════════════════════════════════
   PARSE AI RESPONSE (robust)
   ═══════════════════════════════════════════ */
function parseAIResponse(content: string, agentA: Agent, agentB: Agent): AIBattleResult | null {
  try {
    // Try direct JSON parse first
    let parsed = null;

    // Remove markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    // Remove any <think>...</think> tags (DeepSeek R1 thinking)
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Try to find JSON in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(cleaned);
    }

    if (!parsed) return null;

    // Validate winnerId
    const winnerId = Number(parsed.winnerId);
    if (winnerId !== agentA.id && winnerId !== agentB.id) {
      console.warn('⚠️  Invalid winnerId from AI, defaulting to agentA');
      parsed.winnerId = agentA.id;
    }

    // Ensure battleLog is an array of strings
    let battleLog = parsed.battleLog;
    if (!Array.isArray(battleLog)) {
      battleLog = ['Battle concluded.'];
    }
    battleLog = battleLog.map((line: any) => String(line)).filter((line: string) => line.trim().length > 0);

    // Ensure winner line exists
    const hasWinnerLine = battleLog.some((line: string) => line.includes('🏆'));
    if (!hasWinnerLine) {
      const winnerName = parsed.winnerId === agentA.id ? agentA.name : agentB.name;
      battleLog.push(`🏆 ${winnerName} WINS the battle!`);
    }

    return {
      winnerId: Number(parsed.winnerId),
      loserId: Number(parsed.winnerId) === agentA.id ? agentB.id : agentA.id,
      reasoning: parsed.reasoning || 'The AI has spoken — a worthy champion emerges.',
      battleLog,
    };
  } catch (error) {
    console.error('❌ Failed to parse AI response:', error instanceof Error ? error.message : 'Parse error');
    console.error('   Raw content (first 500 chars):', content.slice(0, 500));
    return null;
  }
}

/* ═══════════════════════════════════════════
   MAIN: SIMULATE BATTLE
   ═══════════════════════════════════════════ */
export async function simulateBattle(agentA: Agent, agentB: Agent): Promise<AIBattleResult | null> {
  if (!config.openrouterKey) {
    console.warn('⚠️  OPENROUTER_API_KEY not configured, using stats-based combat');
    return null;
  }

  const prompt = buildBattlePrompt(agentA, agentB);

  try {
    console.log(`🧠 AI Battle: ${agentA.name} vs ${agentB.name} (model: ${config.aiModel})`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-coliseum.xyz',
        'X-Title': 'AI Coliseum',
      },
      body: JSON.stringify({
        model: config.aiModel || 'deepseek/deepseek-r1:free',
        messages: [
          {
            role: 'system',
            content: 'You are an epic battle narrator. Respond with ONLY valid JSON. No markdown. No explanation outside JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.9,
        top_p: 0.95,
      }),
    });

    if (response.status === 429) {
      console.warn('⚠️  Rate limited by OpenRouter, using stats-based combat');
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenRouter API error (${response.status}):`, errorText.slice(0, 300));
      return null;
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('⚠️  Empty AI response, using stats-based combat');
      return null;
    }

    console.log(`📜 AI response received (${content.length} chars)`);

    const result = parseAIResponse(content, agentA, agentB);

    if (result) {
      console.log(`🏆 AI Winner: ${result.winnerId === agentA.id ? agentA.name : agentB.name}`);
      console.log(`📜 Battle log: ${result.battleLog.length} lines`);
      return result;
    }

    console.warn('⚠️  Could not parse AI response, using stats-based combat');
    return null;
  } catch (error) {
    console.error('❌ AI simulation failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}