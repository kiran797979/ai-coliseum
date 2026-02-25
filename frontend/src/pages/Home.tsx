import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAgents, getFights, getMarkets } from '../api/client'

export default function Home() {
  const [stats, setStats] = useState({ agents: 0, fights: 0, markets: 0, volume: '0' })
  const [recentFights, setRecentFights] = useState<any[]>([])
  const [openMarkets, setOpenMarkets] = useState<any[]>([])
  const [agentMap, setAgentMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [agents, fights, markets] = await Promise.all([getAgents(), getFights(), getMarkets()])
        const map: Record<number, string> = {}
        ;(agents || []).forEach((a: any) => { map[a.id] = a.name })
        setAgentMap(map)
        setStats({
          agents: agents?.length || 0,
          fights: fights?.length || 0,
          markets: markets?.length || 0,
          volume: markets?.reduce((sum: number, m: any) => sum + parseFloat(m.totalPool || '0'), 0).toFixed(1),
        })
        setRecentFights((fights || []).slice(-3).reverse())
        setOpenMarkets((markets || []).filter((m: any) => m.status === 'open').slice(0, 3))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getName = (id: number) => agentMap[id] || `Agent #${id}`

  return (
    <div className="min-h-screen">

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Animated background orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Pixel swords decoration */}
          <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
            ⚔️
          </div>

          {/* Title with glow */}
          <h1
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              textShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '1.3',
            }}
          >
            AI COLISEUM
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-2 font-light tracking-wide">
            Deploy AI Agents. Battle for MON. Bet on Winners.
          </p>

          <p className="text-gray-500 mb-8 text-sm">
            Powered by Monad • 1-second blocks • On-chain combat
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/arena"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            >
              <span className="relative z-10">⚔️ Enter Arena</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              to="/markets"
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-800 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              <span className="relative z-10">🔮 View Markets</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              to="/agents"
              className="group relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-700 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
            >
              <span className="relative z-10">🤖 Deploy Agent</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ LIVE STATS BAR ══════════ */}
      <section className="max-w-6xl mx-auto px-4 -mt-4 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Agents', value: stats.agents, icon: '🤖', color: 'from-purple-500/20 to-purple-900/20', border: 'border-purple-500/30', text: 'text-purple-400' },
            { label: 'Total Fights', value: stats.fights, icon: '⚔️', color: 'from-red-500/20 to-red-900/20', border: 'border-red-500/30', text: 'text-red-400' },
            { label: 'Open Markets', value: stats.markets, icon: '🔮', color: 'from-cyan-500/20 to-cyan-900/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
            { label: 'Chain', value: 'Monad', icon: '⛓️', color: 'from-green-500/20 to-green-900/20', border: 'border-green-500/30', text: 'text-green-400', dot: true },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm border ${stat.border} rounded-xl p-5 text-center transition-all hover:scale-105 hover:border-opacity-60`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.text} mb-1`}>
                {stat.dot && <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />}
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h2
          className="text-2xl font-bold text-white mb-8 text-center"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1.2rem' }}
        >
          ⚡ How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: '🤖', title: 'Deploy Agent', desc: 'Register your AI fighter with unique combat stats' },
            { step: '02', icon: '⚔️', title: 'Create Fight', desc: 'Challenge opponents and wager MON tokens' },
            { step: '03', icon: '🔮', title: 'Place Bets', desc: 'Prediction markets open for every battle' },
            { step: '04', icon: '🏆', title: 'Win Rewards', desc: 'AI resolves fights, winners collect payouts' },
          ].map((item, i) => (
            <div key={i} className="relative group">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-xl p-6 text-center transition-all hover:border-purple-500/50 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)]">
                <div className="text-xs text-purple-500 font-mono mb-3">STEP {item.step}</div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 text-gray-600 text-xl">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ RECENT FIGHTS ══════════ */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1rem' }}
          >
            🔥 Recent Fights
          </h2>
          <Link to="/arena" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
            View All →
          </Link>
        </div>

        {loading && <p className="text-gray-500 text-center py-8">Loading...</p>}

        {!loading && recentFights.length === 0 && (
          <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="text-4xl mb-3">🏟️</p>
            <p className="text-gray-500 mb-3">No fights yet. Be the first!</p>
            <Link to="/arena" className="text-purple-400 hover:text-purple-300 underline text-sm">
              Create a challenge →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentFights.map((fight: any) => (
            <div
              key={fight.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition-all hover:-translate-y-1"
            >
              {/* VS Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <p className={`font-bold text-sm ${fight.winner === fight.agentA ? 'text-yellow-400' : 'text-white'}`}>
                    {fight.winner === fight.agentA && '👑 '}
                    {getName(fight.agentA)}
                  </p>
                </div>
                <div className="px-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-sm font-bold">
                    VS
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <p className={`font-bold text-sm ${fight.winner === fight.agentB ? 'text-yellow-400' : 'text-white'}`}>
                    {fight.winner === fight.agentB && '👑 '}
                    {getName(fight.agentB)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                <span className="text-yellow-400 font-mono text-sm">💰 {fight.stakeAmount} MON</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  fight.status === 'completed' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                  fight.status === 'in_progress' ? 'bg-red-900/50 text-red-400 border border-red-800 animate-pulse' :
                  'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                }`}>
                  {fight.status === 'completed' ? '✅ Finished' :
                   fight.status === 'in_progress' ? '⚡ Live' : '🟡 Open'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ OPEN MARKETS ══════════ */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1rem' }}
          >
            🔮 Open Markets
          </h2>
          <Link to="/markets" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            View All →
          </Link>
        </div>

        {!loading && openMarkets.length === 0 && (
          <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="text-4xl mb-3">🔮</p>
            <p className="text-gray-500 mb-3">No open markets right now.</p>
            <Link to="/markets" className="text-cyan-400 hover:text-cyan-300 underline text-sm">
              Create a market →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {openMarkets.map((market: any) => (
            <div
              key={market.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 hover:border-cyan-500/50 transition-all hover:-translate-y-1"
            >
              <p className="text-white font-bold mb-3">{market.question || `Market #${market.id}`}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-cyan-400 font-mono text-sm">Pool: {market.totalPool || '0'} MON</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-cyan-900/50 text-cyan-400 border border-cyan-800">
                  🟢 Open
                </span>
              </div>
              <Link
                to="/markets"
                className="block w-full text-center py-2 bg-cyan-600/20 border border-cyan-700 rounded-lg text-cyan-400 hover:bg-cyan-600/40 transition-all text-sm font-medium"
              >
                Place Bet →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ BOTTOM CTA ══════════ */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Battle? ⚔️
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Deploy your AI agent, challenge opponents, and earn MON on the fastest blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/agents"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:scale-105 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
            >
              🤖 Deploy Your Agent
            </Link>
            <Link
              to="/leaderboard"
              className="px-8 py-3 bg-gray-800 border border-gray-600 rounded-xl font-bold text-white hover:border-yellow-500/50 hover:scale-105 transition-all"
            >
              🏆 View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.6rem' }}>
            ⚔️ AI Coliseum 2026
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Built on Monad</span>
            <span>•</span>
            <span>AI-Powered Combat</span>
            <span>•</span>
            <span>On-Chain Betting</span>
          </div>
        </div>
      </footer>
    </div>
  )
}