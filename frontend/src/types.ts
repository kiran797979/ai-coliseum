/* ═══════════════════════════════════════════
   AI COLISEUM — TYPE DEFINITIONS
   ═══════════════════════════════════════════ */

// ─── Agent ───────────────────────────────
export type AgentStats = {
  strength: number
  speed: number
  strategy: number
  luck: number
}

export type Agent = {
  id: number
  name: string
  owner: string
  avatar?: string
  wins: number
  losses: number
  totalBattles?: number
  stakedAmount?: string
  isActive?: boolean
  createdAt?: number
  strength?: number
  speed?: number
  strategy?: number
  luck?: number
}

export type AgentWithRank = Agent & {
  rank: number
  winRate: number
  totalEarnings?: string
}

// ─── Battle ──────────────────────────────
export type BattleRound = {
  round: number
  attacker: string
  action: string
  damage?: number
  isCritical?: boolean
  narrative: string
}

export type Fight = {
  id: number
  agentA: number
  agentB: number
  agentAName?: string
  agentBName?: string
  stakeAmount: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  winner?: number
  battleLog: string[]
  rounds?: BattleRound[]
  reasoning?: string
  createdAt?: number
  resolvedAt?: number
}

export type FightWithAgents = Fight & {
  agentAData?: Agent
  agentBData?: Agent
}

// ─── Market ──────────────────────────────
export type MarketOdds = {
  oddsA: number
  oddsB: number
  totalPool: number
  percentA: number
  percentB: number
}

export type Market = {
  id: number
  battleId: number
  question: string
  status: 'open' | 'resolved'
  winner?: number
  totalPool: string
  agentA?: number
  agentB?: number
  agentAName?: string
  agentBName?: string
  poolA?: string
  poolB?: string
  totalPoolA?: string
  totalPoolB?: string
  odds?: MarketOdds
  createdAt?: number
}

export type Bet = {
  id: number
  marketId: number
  bettor: string
  agentId: number
  amount: string
  createdAt?: number
  payout?: string
  claimed?: boolean
}

// ─── Leaderboard ─────────────────────────
export type LeaderboardEntry = {
  rank: number
  agent: Agent
  winRate: number
  totalEarnings: string
  streak: number
}

// ─── App State ───────────────────────────
export type WalletState = {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isCorrectChain: boolean
}

export type AppStats = {
  totalAgents: number
  totalFights: number
  completedFights: number
  totalMarkets: number
  totalVolume?: string
}

// ─── UI State ────────────────────────────
export type BattlePhase =
  | 'idle'
  | 'countdown'
  | 'fighting'
  | 'round_result'
  | 'victory'
  | 'finished'

export type ToastType = 'success' | 'error' | 'loading' | 'fight' | 'bet' | 'win'

// ─── Helpers ─────────────────────────────
export function getWinRate(agent: Agent): number {
  const total = agent.wins + agent.losses
  if (total === 0) return 0
  return Math.round((agent.wins / total) * 100)
}

export function getAgentPowerLevel(agent: Agent): number {
  return (
    (agent.strength || 50) +
    (agent.speed || 50) +
    (agent.strategy || 50) +
    (agent.luck || 50)
  )
}

export function getRankTier(agent: Agent): 'bronze' | 'silver' | 'gold' | 'diamond' | 'champion' {
  const power = getAgentPowerLevel(agent)
  if (power >= 320) return 'champion'
  if (power >= 280) return 'diamond'
  if (power >= 240) return 'gold'
  if (power >= 200) return 'silver'
  return 'bronze'
}

export const RANK_COLORS = {
  bronze: { text: '#cd7f32', glow: 'rgba(205, 127, 50, 0.4)', emoji: '🥉' },
  silver: { text: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.4)', emoji: '🥈' },
  gold: { text: '#ffd700', glow: 'rgba(255, 215, 0, 0.4)', emoji: '🥇' },
  diamond: { text: '#b9f2ff', glow: 'rgba(185, 242, 255, 0.5)', emoji: '💎' },
  champion: { text: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.5)', emoji: '👑' },
} as const