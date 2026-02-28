import { useState, useEffect } from 'react'
import { getOdds, placeBet, getAgents } from '../api/client'
import OddsBar from './OddsBar'
import toast from 'react-hot-toast'

export default function MarketCard({ market }: { market: any }) {
  const [odds, setOdds] = useState({ yesOdds: 50, noOdds: 50, totalPool: 0 })
  const [agents, setAgents] = useState<any[]>([])
  const [betOpen, setBetOpen] = useState(false)
  const [betSide, setBetSide] = useState<'A' | 'B' | null>(null)
  const [betAmount, setBetAmount] = useState('5')
  const [betting, setBetting] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [o, a] = await Promise.all([getOdds(market.id), getAgents()])
        if (mounted) {
          setOdds(o)
          setAgents(a)
        }
      } catch {
        // silent
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [market.id])

  const getName = (id: number) => {
    const agent = agents.find((a: any) => a.id === id)
    return agent?.name || `Agent #${id}`
  }

  const total = (odds.yesOdds || 0) + (odds.noOdds || 0)
  const yesPct = total > 0 ? Math.round((odds.yesOdds / total) * 100) : 50
  const noPct = 100 - yesPct
  const isOpen = market.status === 'open'
  const poolTotal = odds.totalPool || market.totalPool || 0

  /* ── Potential payout calculation ── */
  const calcPayout = () => {
    const amount = parseFloat(betAmount) || 0
    if (amount <= 0) return '0'
    const myPool = betSide === 'A' ? (odds.yesOdds || 0) : (odds.noOdds || 0)
    const otherPool = betSide === 'A' ? (odds.noOdds || 0) : (odds.yesOdds || 0)
    const newMyPool = myPool + amount
    const payout = amount + (amount / newMyPool) * otherPool
    return payout.toFixed(2)
  }

  const multiplier = () => {
    const amount = parseFloat(betAmount) || 0
    if (amount <= 0) return '0.00'
    const payout = parseFloat(calcPayout())
    return (payout / amount).toFixed(2)
  }

  const handleBet = async () => {
    if (!betSide || !betAmount) return
    setBetting(true)
    try {
      let bettor = '0x0'
      try {
        const accounts = await (window as any).ethereum?.request({
          method: 'eth_accounts',
        })
        if (accounts?.[0]) bettor = accounts[0]
      } catch {
        // no wallet
      }
      const agentId = betSide === 'A' ? market.agentA : market.agentB
      await placeBet(market.id, { bettor, agentId, amount: betAmount })
      toast.success('🎲 Bet placed!')
      setBetOpen(false)
      const o = await getOdds(market.id)
      setOdds(o)
    } catch (e: any) {
      toast.error(e?.message || 'Bet failed')
    } finally {
      setBetting(false)
    }
  }

  const agentAName = getName(market.agentA)
  const agentBName = getName(market.agentB)

  return (
    <>
      {/* ══ Market Card ══ */}
      <div
        className={`game-card game-card-cyan p-5 group ${
          isOpen ? '' : 'opacity-80'
        }`}
      >
        {/* ── Top Row: Status + ID ── */}
        <div className="flex justify-between items-start mb-3">
          <div
            className={`status-badge ${isOpen ? 'open' : 'completed'}`}
          >
            <span className="status-dot" />
            {isOpen ? 'OPEN' : 'RESOLVED'}
          </div>
          <span className="text-gray-600 text-xs font-mono">#{market.id}</span>
        </div>

        {/* ── Question ── */}
        <h3 className="text-white font-bold text-sm mb-4 leading-relaxed group-hover:text-cyan-100 transition-colors">
          🔮 {market.question || `Who wins Fight #${market.battleId}?`}
        </h3>

        {/* ── Agents VS Row ── */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div
              className="agent-avatar small"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(6,182,212,0.2))',
              }}
            >
              🤖
            </div>
            <span className="text-green-400 text-xs font-bold truncate max-w-[80px]">
              {agentAName}
            </span>
          </div>
          <span className="text-gray-600 text-[10px] font-mono">vs</span>
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xs font-bold truncate max-w-[80px]">
              {agentBName}
            </span>
            <div
              className="agent-avatar small"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(236,72,153,0.2))',
              }}
            >
              🤖
            </div>
          </div>
        </div>

        {/* ── Odds Bar ── */}
        <div className="mb-4">
          <OddsBar
            yesPct={yesPct}
            noPct={noPct}
            yesLabel={agentAName}
            noLabel={agentBName}
            size="md"
            animated={true}
          />
        </div>

        {/* ── Pool Info ── */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-black/20 rounded-xl border border-gray-800/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Total Pool</span>
          </div>
          <span className="mon-amount text-yellow-400 text-sm">
            💰 {poolTotal} <span className="mon-symbol">MON</span>
          </span>
        </div>

        {/* ── Winner Banner (if resolved) ── */}
        {market.winner && (
          <div className="text-center py-2.5 px-3 bg-yellow-900/20 border border-yellow-800/30 rounded-xl mb-4 animate-fade-in-up">
            <span className="text-yellow-400 font-bold text-sm">
              🏆 {getName(market.winner)} wins
            </span>
          </div>
        )}

        {/* ── Bet Buttons ── */}
        {isOpen && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setBetSide('A')
                setBetOpen(true)
              }}
              className="btn-shine py-2.5 bg-green-600/15 border border-green-500/30 rounded-xl text-green-400 font-bold text-xs transition-all hover:bg-green-600/30 hover:border-green-500/50 hover:shadow-glow-green hover:scale-[1.02] active:scale-95"
            >
              <span className="block">📈 Bet {agentAName}</span>
              <span className="block text-green-500/60 text-[10px] mt-0.5 font-mono">
                {yesPct}% odds
              </span>
            </button>
            <button
              onClick={() => {
                setBetSide('B')
                setBetOpen(true)
              }}
              className="btn-shine py-2.5 bg-red-600/15 border border-red-500/30 rounded-xl text-red-400 font-bold text-xs transition-all hover:bg-red-600/30 hover:border-red-500/50 hover:shadow-glow-red hover:scale-[1.02] active:scale-95"
            >
              <span className="block">📉 Bet {agentBName}</span>
              <span className="block text-red-500/60 text-[10px] mt-0.5 font-mono">
                {noPct}% odds
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          BET MODAL
         ══════════════════════════════════════════ */}
      {betOpen && (
        <div className="modal-backdrop" onClick={() => setBetOpen(false)}>
          <div
            className="modal-content max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-px-heading text-xs text-white">🎲 Place Bet</h3>
              <button
                onClick={() => setBetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Your Pick */}
            <div
              className={`text-center py-3 rounded-xl border mb-4 animate-scale-in ${
                betSide === 'A'
                  ? 'bg-green-900/15 border-green-700/40'
                  : 'bg-red-900/15 border-red-700/40'
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">Your Pick</p>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="agent-avatar small"
                  style={{
                    background:
                      betSide === 'A'
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(239,68,68,0.2)',
                  }}
                >
                  🤖
                </div>
                <p
                  className={`font-bold ${
                    betSide === 'A' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {betSide === 'A' ? agentAName : agentBName}
                </p>
              </div>
              <p className="text-gray-600 text-[10px] mt-1 font-mono">
                Current odds: {betSide === 'A' ? yesPct : noPct}%
              </p>
            </div>

            {/* Switch side */}
            <button
              onClick={() => setBetSide(betSide === 'A' ? 'B' : 'A')}
              className="w-full mb-4 py-1.5 text-gray-500 hover:text-white text-xs font-mono border border-white/5 rounded-lg hover:bg-white/5 transition-all"
            >
              ↔ Switch to {betSide === 'A' ? agentBName : agentAName}
            </button>

            {/* Amount */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              💰 Bet Amount (MON)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="5"
              min="0.1"
              className="input-game mb-3"
            />

            {/* Quick amounts */}
            <div className="flex gap-1.5 mb-4">
              {['1', '5', '10', '25', '50'].map((a) => (
                <button
                  key={a}
                  onClick={() => setBetAmount(a)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    betAmount === a
                      ? 'bg-purple-600 text-white shadow-glow-purple'
                      : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Payout Preview */}
            {parseFloat(betAmount) > 0 && (
              <div className="glass-card p-3 mb-4 animate-fade-in-up">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-xs">Potential Payout</span>
                  <span className="mon-amount positive text-sm">
                    {calcPayout()} <span className="mon-symbol">MON</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Multiplier</span>
                  <span className="text-cyan-400 font-bold text-sm font-mono">
                    {multiplier()}x
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-[10px]">Net Profit</span>
                    <span className="text-green-400 text-[11px] font-mono">
                      +{(parseFloat(calcPayout()) - parseFloat(betAmount || '0')).toFixed(2)} MON
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleBet}
              disabled={betting || !betAmount || parseFloat(betAmount) <= 0}
              className="btn-battle btn-shine w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold transition-all"
            >
              {betting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Placing bet...
                </span>
              ) : (
                `🎲 Bet ${betAmount} MON on ${betSide === 'A' ? agentAName : agentBName}`
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}