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
        if (mounted) { setOdds(o); setAgents(a) }
      } catch {}
    }
    load()
    return () => { mounted = false }
  }, [market.id])

  const getName = (id: number) => {
    const agent = agents.find((a: any) => a.id === id)
    return agent?.name || `Agent #${id}`
  }

  const total = (odds.yesOdds || 0) + (odds.noOdds || 0)
  const yesPct = total > 0 ? Math.round((odds.yesOdds / total) * 100) : 50
  const noPct = 100 - yesPct
  const isOpen = market.status === 'open'

  const handleBet = async () => {
    if (!betSide || !betAmount) return
    setBetting(true)
    try {
      let bettor = '0x0'
      try {
        const accounts = await (window as any).ethereum?.request({ method: 'eth_accounts' })
        if (accounts?.[0]) bettor = accounts[0]
      } catch {}
      const agentId = betSide === 'A' ? market.agentA : market.agentB
      await placeBet(market.id, { bettor, agentId, amount: betAmount })
      toast.success('Bet placed! 🎲')
      setBetOpen(false)
      const o = await getOdds(market.id)
      setOdds(o)
    } catch (e: any) {
      toast.error(e?.message || 'Bet failed')
    } finally {
      setBetting(false)
    }
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 group ${
        isOpen
          ? 'border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)]'
          : 'border-gray-700/50 hover:border-gray-600'
      }`}>

        {/* Top row */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
            isOpen
              ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800/50'
              : 'bg-green-900/40 text-green-400 border border-green-800/50'
          }`}>
            {isOpen ? '🟢 OPEN' : '✅ RESOLVED'}
          </span>
          <span className="text-gray-600 text-xs font-mono">#{market.id}</span>
        </div>

        {/* Question */}
        <h3 className="text-white font-bold text-sm mb-4 leading-relaxed group-hover:text-gray-100">
          {market.question || `Who wins Fight #${market.battleId}?`}
        </h3>

        {/* Odds Bar */}
        <div className="mb-4">
          <OddsBar yesPct={yesPct} noPct={noPct} size="md" />
        </div>

        {/* Pool */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-black/20 rounded-xl border border-gray-800/50 mb-4">
          <span className="text-gray-500 text-xs">Pool</span>
          <span className="text-yellow-400 font-mono font-bold text-sm">💰 {odds.totalPool || market.totalPool || 0} MON</span>
        </div>

        {/* Winner (if resolved) */}
        {market.winner && (
          <div className="text-center py-2.5 px-3 bg-yellow-900/20 border border-yellow-800/30 rounded-xl mb-4">
            <span className="text-yellow-400 font-bold text-sm">🏆 {getName(market.winner)} wins</span>
          </div>
        )}

        {/* Bet Buttons */}
        {isOpen && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setBetSide('A'); setBetOpen(true) }}
              className="py-2.5 bg-green-600/20 border border-green-500/30 rounded-xl text-green-400 font-bold text-xs transition-all hover:bg-green-600/40 hover:border-green-500/50 hover:shadow-[0_0_12px_rgba(34,197,94,0.2)] hover:scale-[1.02] active:scale-95"
            >
              📈 Bet A ({yesPct}%)
            </button>
            <button
              onClick={() => { setBetSide('B'); setBetOpen(true) }}
              className="py-2.5 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 font-bold text-xs transition-all hover:bg-red-600/40 hover:border-red-500/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-95"
            >
              📉 Bet B ({noPct}%)
            </button>
          </div>
        )}
      </div>

      {/* ═══ Bet Modal ═══ */}
      {betOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setBetOpen(false)}>
          <div className="bg-gradient-to-br from-[#12132e] to-[#0b0c1a] border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[modalSlideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white">🎲 Place Bet</h3>
              <button onClick={() => setBetOpen(false)} className="text-gray-500 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {/* Your pick */}
            <div className={`text-center py-3 rounded-xl border mb-4 ${
              betSide === 'A'
                ? 'bg-green-900/20 border-green-700/40 text-green-400'
                : 'bg-red-900/20 border-red-700/40 text-red-400'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Your Pick</p>
              <p className="font-bold">{betSide === 'A' ? getName(market.agentA) : getName(market.agentB)}</p>
            </div>

            {/* Amount */}
            <label className="block text-gray-500 text-xs mb-1.5">Amount (MON)</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              placeholder="5"
              min="0.1"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white mb-3 focus:border-purple-500 outline-none font-mono transition-colors"
            />

            {/* Quick amounts */}
            <div className="flex gap-1.5 mb-5">
              {['1', '5', '10', '25'].map(a => (
                <button
                  key={a}
                  onClick={() => setBetAmount(a)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    betAmount === a ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              onClick={handleBet}
              disabled={betting || !betAmount || parseFloat(betAmount) <= 0}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95"
            >
              {betting ? '⏳ Placing...' : `🎲 Bet ${betAmount} MON`}
            </button>
          </div>
        </div>
      )}
    </>
  )
}