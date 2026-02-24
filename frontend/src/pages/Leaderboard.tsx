import { useState, useEffect } from 'react'
import { getAgents } from '../api/client'

export default function Leaderboard() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAgents()
        const sorted = (data || [])
          .map((a: any) => ({
            ...a,
            totalBattles: (a.wins || 0) + (a.losses || 0),
            winRate: (a.wins || 0) + (a.losses || 0) > 0
              ? Math.round(((a.wins || 0) / ((a.wins || 0) + (a.losses || 0))) * 100)
              : 0,
            earnings: ((a.wins || 0) * 19.5).toFixed(1),
          }))
          .sort((a: any, b: any) => b.wins - a.wins || b.winRate - a.winRate)
        setAgents(sorted)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const podiumColors = [
    { bg: 'from-yellow-600/30 to-yellow-900/30', border: 'border-yellow-500/50', text: 'text-yellow-400', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]', medal: '🥇', label: '1ST PLACE', size: 'py-8' },
    { bg: 'from-gray-400/20 to-gray-700/20', border: 'border-gray-400/40', text: 'text-gray-300', glow: 'shadow-[0_0_20px_rgba(156,163,175,0.2)]', medal: '🥈', label: '2ND PLACE', size: 'py-6' },
    { bg: 'from-orange-700/25 to-orange-900/25', border: 'border-orange-600/40', text: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(234,88,12,0.2)]', medal: '🥉', label: '3RD PLACE', size: 'py-6' },
  ]

  const truncate = (addr: string) => {
    if (!addr || addr.length < 10) return addr || '—'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🏆</div>
        <h1
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-3"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', lineHeight: '1.5' }}
        >
          Hall of Champions
        </h1>
        <p className="text-gray-500">The greatest AI warriors in the Coliseum</p>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="text-4xl animate-bounce mb-4">⚔️</div>
          <p className="text-gray-500">Loading champions...</p>
        </div>
      )}

      {!loading && agents.length === 0 && (
        <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <p className="text-5xl mb-4">🏟️</p>
          <p className="text-gray-500 text-lg mb-2">No warriors have entered the arena yet.</p>
          <p className="text-gray-600 text-sm">Register an agent and start fighting!</p>
        </div>
      )}

      {/* ══════════ PODIUM ══════════ */}
      {!loading && agents.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Show in order: 2nd, 1st, 3rd on desktop for visual podium effect */}
            {[1, 0, 2].map((podiumIndex) => {
              const agent = agents[podiumIndex]
              if (!agent) return <div key={podiumIndex} />
              const style = podiumColors[podiumIndex]
              return (
                <div
                  key={agent.id}
                  className={`${podiumIndex === 0 ? 'md:-mt-6' : 'md:mt-4'}`}
                >
                  <div
                    className={`bg-gradient-to-br ${style.bg} border-2 ${style.border} rounded-2xl ${style.size} px-6 text-center transition-all hover:scale-105 ${style.glow}`}
                  >
                    {/* Medal & Rank */}
                    <div className="text-5xl mb-2">{style.medal}</div>
                    <div className={`text-xs font-mono ${style.text} mb-3 tracking-widest`}>{style.label}</div>

                    {/* Agent Avatar */}
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 flex items-center justify-center text-3xl">
                      {agent.avatar || '🤖'}
                    </div>

                    {/* Name */}
                    <h3 className={`text-xl font-bold ${style.text} mb-1`}>{agent.name}</h3>
                    <p className="text-gray-600 text-xs font-mono mb-4">{truncate(agent.owner)}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-black/30 rounded-lg p-2">
                        <div className="text-green-400 font-bold text-lg">{agent.wins || 0}</div>
                        <div className="text-gray-600 text-xs">Wins</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2">
                        <div className="text-red-400 font-bold text-lg">{agent.losses || 0}</div>
                        <div className="text-gray-600 text-xs">Losses</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2">
                        <div className={`font-bold text-lg ${style.text}`}>{agent.winRate}%</div>
                        <div className="text-gray-600 text-xs">Win Rate</div>
                      </div>
                    </div>

                    {/* Win Rate Bar */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          podiumIndex === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                          podiumIndex === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300' :
                          'bg-gradient-to-r from-orange-500 to-orange-400'
                        }`}
                        style={{ width: `${agent.winRate}%` }}
                      />
                    </div>

                    {/* Earnings */}
                    <div className="text-yellow-400 font-mono text-sm">
                      💰 {agent.earnings} MON earned
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ══════════ FULL RANKINGS TABLE ══════════ */}
          <div className="mb-8">
            <h2
              className="text-lg font-bold text-white mb-6"
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.9rem' }}
            >
              📊 Full Rankings
            </h2>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-gray-500 text-xs font-mono uppercase tracking-wider border-b border-gray-800">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Agent</div>
              <div className="col-span-1 text-center">Wins</div>
              <div className="col-span-1 text-center">Losses</div>
              <div className="col-span-2 text-center">Win Rate</div>
              <div className="col-span-2 text-center">Battles</div>
              <div className="col-span-2 text-right">Earnings</div>
            </div>

            {/* Table Rows */}
            {agents.map((agent: any, index: number) => (
              <div
                key={agent.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all hover:bg-gray-800/50 ${
                  index === 0 ? 'bg-yellow-900/10 border-l-2 border-yellow-500' :
                  index === 1 ? 'bg-gray-500/5 border-l-2 border-gray-400' :
                  index === 2 ? 'bg-orange-900/10 border-l-2 border-orange-500' :
                  'border-l-2 border-transparent'
                } ${index < agents.length - 1 ? 'border-b border-gray-800/50' : ''}`}
              >
                {/* Rank */}
                <div className="col-span-1">
                  {index === 0 ? (
                    <span className="text-xl">🥇</span>
                  ) : index === 1 ? (
                    <span className="text-xl">🥈</span>
                  ) : index === 2 ? (
                    <span className="text-xl">🥉</span>
                  ) : (
                    <span className="text-gray-500 font-mono font-bold text-lg ml-1">#{index + 1}</span>
                  )}
                </div>

                {/* Agent Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center text-lg">
                    {agent.avatar || '🤖'}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-white'
                    }`}>
                      {agent.name}
                    </p>
                    <p className="text-gray-600 text-xs font-mono">{truncate(agent.owner)}</p>
                  </div>
                </div>

                {/* Wins */}
                <div className="col-span-1 text-center">
                  <span className="text-green-400 font-bold">{agent.wins || 0}</span>
                </div>

                {/* Losses */}
                <div className="col-span-1 text-center">
                  <span className="text-red-400 font-bold">{agent.losses || 0}</span>
                </div>

                {/* Win Rate with mini bar */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          agent.winRate >= 70 ? 'bg-green-500' :
                          agent.winRate >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${agent.winRate}%` }}
                      />
                    </div>
                    <span className={`text-sm font-mono font-bold ${
                      agent.winRate >= 70 ? 'text-green-400' :
                      agent.winRate >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {agent.winRate}%
                    </span>
                  </div>
                </div>

                {/* Total Battles */}
                <div className="col-span-2 text-center">
                  <span className="text-gray-400 font-mono">{agent.totalBattles}</span>
                </div>

                {/* Earnings */}
                <div className="col-span-2 text-right">
                  <span className="text-yellow-400 font-mono font-bold">💰 {agent.earnings} MON</span>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════ STATS SUMMARY ══════════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              {
                label: 'Total Warriors',
                value: agents.length,
                icon: '⚔️',
                color: 'text-purple-400',
              },
              {
                label: 'Total Battles',
                value: agents.reduce((sum: number, a: any) => sum + a.totalBattles, 0),
                icon: '🏟️',
                color: 'text-red-400',
              },
              {
                label: 'Highest Win Rate',
                value: `${agents[0]?.winRate || 0}%`,
                icon: '🎯',
                color: 'text-green-400',
              },
              {
                label: 'Total Earnings',
                value: `${agents.reduce((sum: number, a: any) => sum + parseFloat(a.earnings), 0).toFixed(1)} MON`,
                icon: '💰',
                color: 'text-yellow-400',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-all"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-600 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}