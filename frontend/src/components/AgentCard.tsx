export default function AgentCard({ agent }: { agent: any }) {
  const wins = agent.wins || 0
  const losses = agent.losses || 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  const truncate = (addr: string) => {
    if (!addr || addr.length < 10) return addr || '—'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  const getRankColor = () => {
    if (winRate >= 80) return { border: 'border-yellow-500/50', glow: 'hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]', badge: 'bg-yellow-900/50 text-yellow-400 border-yellow-700', rank: '⭐ Elite' }
    if (winRate >= 60) return { border: 'border-purple-500/40', glow: 'hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]', badge: 'bg-purple-900/50 text-purple-400 border-purple-700', rank: '💎 Veteran' }
    if (winRate >= 40) return { border: 'border-cyan-500/30', glow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]', badge: 'bg-cyan-900/50 text-cyan-400 border-cyan-700', rank: '🔷 Fighter' }
    return { border: 'border-gray-600/40', glow: 'hover:shadow-[0_0_20px_rgba(100,100,100,0.15)]', badge: 'bg-gray-800 text-gray-400 border-gray-700', rank: '🆕 Rookie' }
  }

  const style = getRankColor()

  return (
    <div className={`bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 ${style.border} rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] ${style.glow} cursor-pointer group`}>

      {/* Top: Badge + ID */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
          {style.rank}
        </span>
        <span className="text-gray-600 text-xs font-mono">#{agent.id}</span>
      </div>

      {/* Avatar */}
      <div className="text-center mb-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300 group-hover:border-purple-500/50">
          {agent.avatar || '🤖'}
        </div>
      </div>

      {/* Name + Owner */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{agent.name}</h3>
        <p className="text-gray-600 text-xs font-mono mt-1">{truncate(agent.owner)}</p>
      </div>

      {/* W-L Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/30 rounded-xl p-2.5 text-center">
          <div className="text-green-400 font-bold text-lg">{wins}</div>
          <div className="text-gray-600 text-xs">Wins</div>
        </div>
        <div className="bg-black/30 rounded-xl p-2.5 text-center">
          <div className="text-red-400 font-bold text-lg">{losses}</div>
          <div className="text-gray-600 text-xs">Losses</div>
        </div>
        <div className="bg-black/30 rounded-xl p-2.5 text-center">
          <div className={`font-bold text-lg ${winRate >= 60 ? 'text-green-400' : winRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {winRate}%
          </div>
          <div className="text-gray-600 text-xs">Rate</div>
        </div>
      </div>

      {/* Win Rate Bar */}
      <div className="mb-4">
        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              winRate >= 60 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
              winRate >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
              winRate > 0 ? 'bg-gradient-to-r from-red-500 to-rose-400' :
              'bg-gray-700'
            }`}
            style={{ width: `${Math.max(winRate, 3)}%` }}
          />
        </div>
      </div>

      {/* Footer: Battles + Status */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-800">
        <span className="text-gray-500 text-xs">
          ⚔️ {total} battle{total !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${agent.isActive !== false ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className={agent.isActive !== false ? 'text-green-400' : 'text-gray-600'}>
            {agent.isActive !== false ? 'Active' : 'Inactive'}
          </span>
        </span>
      </div>
    </div>
  )
}