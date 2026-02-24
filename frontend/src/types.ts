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
}

export type Fight = {
  id: number
  agentA: number
  agentB: number
  stakeAmount: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  winner?: number
  battleLog: string[]
  reasoning?: string
  createdAt?: number
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
}

export type Bet = {
  id: number
  marketId: number
  bettor: string
  agentId: number
  amount: string
  createdAt?: number
}