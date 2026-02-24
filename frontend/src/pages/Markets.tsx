import { useState, useEffect } from 'react'
import { getMarkets, getFights, getAgents, createMarket, placeBet, getOdds } from '../api/client'
import toast from 'react-hot-toast'

export default function Markets() {
  const [markets, setMarkets] = useState<any[]>([])
  const [fights, setFights] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [agentMap, setAgentMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedFight, setSelectedFight] = useState('')
  const [creating, setCreating] = useState(false)

  // Bet modal state
  const [betMarket, setBetMarket] = useState<any>(null)
  const [betSide, setBetSide] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState('5')
  const [betting, setBetting] = useState(false)
  const [odds, setOdds] = useState<Record<number, any>>({})

  const fetchData = async () => {
    setLoading(true)
    try {
      const [m, f, a] = await Promise.all([getMarkets(), getFights(), getAgents()])
      setMarkets(m || [])
      setFights(f || [])
      setAgents(a || [])
      const map: Record<number, string> = {}
      ;(a || []).forEach((ag: any) => { map[ag.id] = ag.name })
      setAgentMap(map)

      // Fetch odds for open markets
      const oddsMap: Record<number, any> = {}
      for (const market of (m || [])) {
        if (market.status === 'open') {
          try {
            const o = await getOdds(market.id)
            oddsMap[market.id] = o
          } catch {}
        }
      }
      setOdds(oddsMap)
    } catch (e: any) {
      toast.error('Failed to load markets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const getName = (id: number) => agentMap[id] || `Agent #${id}`

  const handleCreateMarket = async () => {
    if (!selectedFight) return toast.error('Select a fight')
    const fight = fights.find((f: any) => f.id === Number(selectedFight))
    if (!fight) return toast.error('Fight not found')
    setCreating(true)
    try {
      await createMarket({ battleId: fight.id, agentA: fight.agentA, agentB: fight.agentB })
      toast.success('Market created! 🔮')
      setShowCreate(false)
      setSelectedFight('')
      fetchData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create market')
    } finally {
      setCreating(false)
    }
  }

  const openBetModal = (market: any, side: number) => {
    setBetMarket(market)
    setBetSide(side)
    setBetAmount('5')
  }

  const handlePlaceBet = async () => {
    if (!betMarket || betSide === null) return
    if (!betAmount || parseFloat(betAmount) <= 0) return toast.error('Enter a valid amount')
    setBetting(true)
    try {
      let bettor = '0x0000000000000000000000000000000000000000'
      try {
        if ((window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts?.[0]) bettor = accounts[0]
        }
      } catch {}
      await placeBet(betMarket.id, { bettor, agentId: betSide, amount: betAmount })
      toast.success('Bet placed! 🎲')
      setBetMarket(null)
      setBetSide(null)
      fetchData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to place bet')
    } finally {
      setBetting(false)
    }
  }

  const filtered = markets.filter((m: any) => {
    if (filter === 'all') return true
    return m.status === filter
  })

  const getOddsPct = (marketId: number) => {
    const o = odds[marketId]
    if (!o) return { yesPct: 50, noPct: 50, total: 0 }
    const total = (o.yesOdds || 0) + (o.noOdds || 0)
    if (total === 0) return { yesPct: 50, noPct: 50, total: 0 }
    return {
      yesPct: Math.round((o.yesOdds / total) * 100),
      noPct: Math.round((o.noOdds / total) * 100),
      total: o.totalPool || total,
    }
  }

  const getPayout = () => {
    if (!betMarket || betSide === null || !betAmount) return '0.00'
    const o = odds[betMarket.id]
    if (!o) return parseFloat(betAmount).toFixed(2)
    const myAmount = parseFloat(betAmount)
    const winPool = betSide === betMarket.agentA ? (o.yesOdds || 0) : (o.noOdds || 0)
    const losePool = betSide === betMarket.agentA ? (o.noOdds || 0) : (o.yesOdds || 0)
    if (winPool + myAmount === 0) return myAmount.toFixed(2)
    const payout = myAmount + (myAmount / (winPool + myAmount)) * losePool
    return payout.toFixed(2)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', lineHeight: '1.5' }}
          >
            🔮 Prediction Markets
          </h1>
          <p className="text-gray-500 text-sm">Bet on AI combat outcomes. Winners take the pool.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          + Create Market
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {['all', 'open', 'resolved'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            {tab === 'all' ? '🌐 All' : tab === 'open' ? '🟢 Open' : '✅ Resolved'}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="text-4xl animate-bounce mb-4">🔮</div>
          <p className="text-gray-500">Loading markets...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800 rounded-2xl">
          <p className="text-5xl mb-4">🔮</p>
          <p className="text-gray-400 text-lg mb-2">No markets found.</p>
          <p className="text-gray-600 text-sm mb-4">Create a market from a fight to start betting!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-cyan-400 hover:text-cyan-300 underline text-sm"
          >
            Create your first market →
          </button>
        </div>
      )}

      {/* Market Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((market: any) => {
          const { yesPct, noPct, total } = getOddsPct(market.id)
          const isOpen = market.status === 'open'
          const isResolved = market.status === 'resolved'

          return (
            <div
              key={market.id}
              className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 border rounded-2xl p-6 transition-all hover:-translate-y-1 ${
                isOpen ? 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]' :
                'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isOpen ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' :
                  'bg-green-900/50 text-green-400 border border-green-800'
                }`}>
                  {isOpen ? '🟢 Open' : '✅ Resolved'}
                </span>
                <span className="text-gray-600 text-xs font-mono">#{market.id}</span>
              </div>

              {/* Question */}
              <h3 className="text-white font-bold text-lg mb-4 leading-tight">
                {market.question || `Who wins Fight #${market.battleId}?`}
              </h3>

              {/* Odds Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-green-400 font-bold">Agent A — {yesPct}%</span>
                  <span className="text-red-400 font-bold">{noPct}% — Agent B</span>
                </div>
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-800 border border-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700 rounded-l-full"
                    style={{ width: `${yesPct}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-700 rounded-r-full"
                    style={{ width: `${noPct}%` }}
                  />
                </div>
              </div>

              {/* Pool Info */}
              <div className="flex justify-between items-center mb-4 py-3 px-4 bg-black/30 rounded-xl">
                <div>
                  <span className="text-gray-500 text-xs">Total Pool</span>
                  <p className="text-yellow-400 font-mono font-bold">💰 {total || market.totalPool || '0'} MON</p>
                </div>
                {isResolved && market.winner && (
                  <div className="text-right">
                    <span className="text-gray-500 text-xs">Winner</span>
                    <p className="text-yellow-400 font-bold">🏆 {getName(market.winner)}</p>
                  </div>
                )}
              </div>

              {/* Bet Buttons */}
              {isOpen && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openBetModal(market, market.agentA || market.battleId)}
                    className="py-3 bg-gradient-to-r from-green-600/80 to-emerald-700/80 border border-green-500/30 rounded-xl text-white font-bold transition-all hover:from-green-500 hover:to-emerald-600 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-105"
                  >
                    <span className="text-lg">📈</span>
                    <br />
                    <span className="text-sm">Bet Agent A</span>
                  </button>
                  <button
                    onClick={() => openBetModal(market, market.agentB || market.battleId + 1)}
                    className="py-3 bg-gradient-to-r from-red-600/80 to-rose-700/80 border border-red-500/30 rounded-xl text-white font-bold transition-all hover:from-red-500 hover:to-rose-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-105"
                  >
                    <span className="text-lg">📉</span>
                    <br />
                    <span className="text-sm">Bet Agent B</span>
                  </button>
                </div>
              )}

              {isResolved && (
                <div className="text-center py-3 bg-green-900/20 border border-green-800/30 rounded-xl">
                  <span className="text-green-400 font-bold">✅ Market Resolved</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ══════════ CREATE MARKET MODAL ══════════ */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">🔮 Create Market</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white text-2xl transition-colors">&times;</button>
            </div>

            <p className="text-gray-400 text-sm mb-4">Select a fight to create a prediction market for:</p>

            {/* Fight Selection */}
            <label className="block text-gray-400 text-sm mb-2">Select Fight</label>
            <select
              value={selectedFight}
              onChange={(e) => setSelectedFight(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white mb-4 focus:border-cyan-500 outline-none transition-colors"
            >
              <option value="">-- Choose a fight --</option>
              {fights.map((f: any) => (
                <option key={f.id} value={f.id}>
                  Fight #{f.id}: {getName(f.agentA)} vs {getName(f.agentB)} ({f.stakeAmount} MON)
                </option>
              ))}
            </select>

            {/* Preview */}
            {selectedFight && (() => {
              const f = fights.find((fi: any) => fi.id === Number(selectedFight))
              if (!f) return null
              return (
                <div className="bg-black/30 rounded-xl p-4 mb-6 text-center border border-gray-700">
                  <p className="text-gray-500 text-xs mb-2">Market Question</p>
                  <p className="text-white font-bold">
                    "Who will win: <span className="text-green-400">{getName(f.agentA)}</span> vs <span className="text-red-400">{getName(f.agentB)}</span>?"
                  </p>
                  <p className="text-yellow-400 text-sm mt-2">💰 {f.stakeAmount} MON at stake</p>
                </div>
              )
            })()}

            <button
              onClick={handleCreateMarket}
              disabled={creating || !selectedFight}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {creating ? '⏳ Creating...' : '🔮 Create Market'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ BET MODAL ══════════ */}
      {betMarket && betSide !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(139,92,246,0.15)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">🎲 Place Bet</h2>
              <button onClick={() => { setBetMarket(null); setBetSide(null) }} className="text-gray-400 hover:text-white text-2xl transition-colors">&times;</button>
            </div>

            {/* Market Info */}
            <div className="bg-black/30 rounded-xl p-4 mb-4 border border-gray-700">
              <p className="text-gray-500 text-xs mb-1">Market</p>
              <p className="text-white font-bold text-sm">{betMarket.question || `Fight #${betMarket.battleId}`}</p>
            </div>

            {/* Your Pick */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-4 text-center">
              <p className="text-gray-500 text-xs mb-1">Your Pick</p>
              <p className="text-purple-400 font-bold text-lg">{getName(betSide)}</p>
            </div>

            {/* Current Odds */}
            {(() => {
              const { yesPct, noPct } = getOddsPct(betMarket.id)
              return (
                <div className="flex justify-between text-sm mb-4 px-2">
                  <span className="text-green-400">Agent A: {yesPct}%</span>
                  <span className="text-red-400">Agent B: {noPct}%</span>
                </div>
              )
            })()}

            {/* Amount Input */}
            <label className="block text-gray-400 text-sm mb-2">Bet Amount (MON)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="5"
              min="0.1"
              step="0.1"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white mb-4 focus:border-purple-500 outline-none text-lg font-mono transition-colors"
            />

            {/* Quick Amounts */}
            <div className="flex gap-2 mb-4">
              {['1', '5', '10', '25', '50'].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    betAmount === amt
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            {/* Potential Payout */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-gray-500 text-xs mb-1">Potential Payout</p>
              <p className="text-yellow-400 font-bold text-2xl font-mono">💰 {getPayout()} MON</p>
              <p className="text-gray-600 text-xs mt-1">
                {parseFloat(getPayout()) > 0 && parseFloat(betAmount) > 0
                  ? `${((parseFloat(getPayout()) / parseFloat(betAmount) - 1) * 100).toFixed(0)}% potential profit`
                  : ''}
              </p>
            </div>

            {/* Place Bet Button */}
            <button
              onClick={handlePlaceBet}
              disabled={betting || !betAmount || parseFloat(betAmount) <= 0}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-[1.02]"
            >
              {betting ? '⏳ Placing bet...' : `🎲 Bet ${betAmount} MON on ${getName(betSide)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}