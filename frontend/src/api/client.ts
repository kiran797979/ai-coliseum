import type { Agent, Fight, Market } from '../types'

/* ═══════════════════════════════════════════
   API CLIENT — AI COLISEUM
   With auto-retry for Render cold starts
   ═══════════════════════════════════════════ */

const API_BASE = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD
    ? 'https://ai-coliseum.onrender.com'
    : 'http://localhost:3001'
)

/* ─────────────────────────────────────────
   RETRY HELPER
   Render free tier sleeps after 15 min.
   First request can take 30-50s.
   This retries up to 2 times with backoff.
   ───────────────────────────────────────── */

async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 2
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20_000)

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      // Render returns 502/503 while waking — retry those
      if (res.status >= 500 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
        continue
      }

      return res
    } catch (err: any) {
      lastError = err
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Server unavailable — please try again')
}

/* ─────────────────────────────────────────
   CORE REQUEST HELPERS
   ───────────────────────────────────────── */

async function get(path: string) {
  const res = await fetchWithRetry(API_BASE + path)
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message || json?.error || res.statusText)
  return json?.data ?? json
}

async function post(path: string, body?: any) {
  const res = await fetchWithRetry(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message || json?.error || res.statusText)
  return json?.data ?? json
}

/* ─────────────────────────────────────────
   MAPPERS (snake_case API → camelCase)
   ───────────────────────────────────────── */

function mapFight(f: any): Fight {
  let battleLog: string[] = []
  try {
    if (typeof f.battle_log === 'string' && f.battle_log.length > 0) {
      battleLog = JSON.parse(f.battle_log)
    } else if (Array.isArray(f.battle_log)) {
      battleLog = f.battle_log
    } else if (Array.isArray(f.battleLog)) {
      battleLog = f.battleLog
    }
  } catch {
    battleLog = []
  }

  return {
    id: f.id,
    agentA: f.agent_a ?? f.agentA,
    agentB: f.agent_b ?? f.agentB,
    agentAName: f.agent_a_name ?? f.agentAName,
    agentBName: f.agent_b_name ?? f.agentBName,
    stakeAmount: f.stake_amount ?? f.stakeAmount ?? '0',
    status: f.status,
    winner: f.winner,
    battleLog,
    reasoning: f.reasoning,
    createdAt: f.created_at ?? f.createdAt,
  }
}

function mapMarket(m: any): Market {
  return {
    id: m.id,
    battleId: m.battle_id ?? m.battleId,
    question: m.question ?? `Who wins Fight #${m.battle_id ?? m.battleId}?`,
    status: m.status,
    winner: m.winner,
    totalPool: m.total_pool ?? m.totalPool ?? '0',
    agentA: m.agent_a ?? m.agentA,
    agentB: m.agent_b ?? m.agentB,
    totalPoolA: m.total_pool_a ?? m.totalPoolA ?? '0',
    totalPoolB: m.total_pool_b ?? m.totalPoolB ?? '0',
    poolA: m.total_pool_a ?? m.totalPoolA ?? m.poolA ?? '0',
    poolB: m.total_pool_b ?? m.totalPoolB ?? m.poolB ?? '0',
    createdAt: m.created_at ?? m.createdAt,
  }
}

/* ─────────────────────────────────────────
   SERVER WARMUP
   Call on app load so Render wakes up early.
   Fire-and-forget — errors are silenced.
   ───────────────────────────────────────── */

export function warmup(): void {
  fetch(API_BASE + '/health').catch(() => {})
}

/* ─────────────────────────────────────────
   HEALTH
   ───────────────────────────────────────── */

export const getHealth = () => get('/health')

/* ─────────────────────────────────────────
   AGENTS
   ───────────────────────────────────────── */

export const getAgents = (): Promise<Agent[]> => get('/agents')

export const getAgent = (id: number): Promise<Agent> => get(`/agents/${id}`)

export const createAgent = (payload: { name: string; owner: string }): Promise<Agent> =>
  post('/agents', payload)

export const getAgentStats = (id: number) => get(`/agents/${id}/stats`)

/* ─────────────────────────────────────────
   FIGHTS
   ───────────────────────────────────────── */

export const getFights = async (status?: string): Promise<Fight[]> => {
  const path = status ? `/fights?status=${status}` : '/fights'
  const data = await get(path)
  return (Array.isArray(data) ? data : []).map(mapFight)
}

export const getFight = async (id: number): Promise<Fight> =>
  mapFight(await get(`/fights/${id}`))

export const createFight = (payload: {
  agentA: number
  agentB: number
  stakeAmount: string
}): Promise<Fight> => post('/fights', payload)

export const resolveFight = async (id: number): Promise<Fight> => {
  const data = await post(`/fights/${id}/resolve`)
  return mapFight(data)
}

/* ─────────────────────────────────────────
   MARKETS
   ───────────────────────────────────────── */

export const getMarkets = async (): Promise<Market[]> => {
  const data = await get('/markets')
  return (Array.isArray(data) ? data : []).map(mapMarket)
}

export const getMarket = async (id: number): Promise<Market> =>
  mapMarket(await get(`/markets/${id}`))

export const createMarket = (payload: {
  battleId: number
  agentA: number
  agentB: number
}): Promise<Market> => post('/markets', payload)

export const placeBet = async (
  marketId: number,
  payload: { bettor?: string; agentId: number; amount: string }
) => {
  const body = {
    bettor: payload.bettor || '0x0000000000000000000000000000000000000000',
    agentId: Number(payload.agentId),
    amount: String(payload.amount),
  }
  return post(`/markets/${marketId}/bet`, body)
}

export const getOdds = (marketId: number) => get(`/markets/${marketId}/odds`)

export const resolveMarket = (marketId: number, winner: number) =>
  post(`/markets/${marketId}/resolve`, { winner })

export const getBets = (marketId: number) => get(`/markets/${marketId}/bets`)