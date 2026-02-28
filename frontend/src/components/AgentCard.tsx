export default function AgentCard({ agent, rank }: { agent: any; rank?: number }) {
  const wins = agent.wins || 0
  const losses = agent.losses || 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  /* ── Stats (from API or generated) ── */
  const strength = agent.strength ?? Math.floor(Math.random() * 40 + 50)
  const speed = agent.speed ?? Math.floor(Math.random() * 40 + 50)
  const strategy = agent.strategy ?? Math.floor(Math.random() * 40 + 50)
  const luck = agent.luck ?? Math.floor(Math.random() * 40 + 50)
  const powerLevel = strength + speed + strategy + luck

  const truncate = (addr: string) => {
    if (!addr || addr.length < 10) return addr || '—'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  /* ── Rank tier ── */
  const getRankTier = () => {
    if (powerLevel >= 320)
      return {
        tier: 'champion',
        label: '👑 Champion',
        borderClass: 'border-red-400/40',
        glowClass: 'hover:shadow-glow-red',
        badgeClass: 'rank-badge champion',
        avatarBg: 'linear-gradient(135deg, rgba(255,107,107,0.25), rgba(239,68,68,0.15))',
      }
    if (powerLevel >= 280)
      return {
        tier: 'diamond',
        label: '💎 Diamond',
        borderClass: 'border-cyan-300/30',
        glowClass: 'hover:shadow-glow-cyan',
        badgeClass: 'rank-badge diamond',
        avatarBg: 'linear-gradient(135deg, rgba(185,242,255,0.2), rgba(6,182,212,0.15))',
      }
    if (powerLevel >= 240)
      return {
        tier: 'gold',
        label: '🥇 Gold',
        borderClass: 'border-yellow-500/30',
        glowClass: 'hover:shadow-glow-gold',
        badgeClass: 'rank-badge gold',
        avatarBg: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(245,158,11,0.15))',
      }
    if (powerLevel >= 200)
      return {
        tier: 'silver',
        label: '🥈 Silver',
        borderClass: 'border-gray-400/30',
        glowClass: 'hover:shadow-[0_0_20px_rgba(192,192,192,0.15)]',
        badgeClass: 'rank-badge silver',
        avatarBg: 'linear-gradient(135deg, rgba(192,192,192,0.15), rgba(160,160,160,0.1))',
      }
    return {
      tier: 'bronze',
      label: '🥉 Bronze',
      borderClass: 'border-orange-700/30',
      glowClass: 'hover:shadow-[0_0_20px_rgba(205,127,50,0.15)]',
      badgeClass: 'rank-badge bronze',
      avatarBg: 'linear-gradient(135deg, rgba(205,127,50,0.15), rgba(160,100,40,0.1))',
    }
  }

  const tier = getRankTier()

  /* ── Stat bar component ── */
  const StatBar = ({
    label,
    value,
    type,
    icon,
  }: {
    label: string
    value: number
    type: string
    icon: string
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs w-4 text-center">{icon}</span>
      <span className="text-gray-500 text-[10px] w-10 uppercase font-bold tracking-wider">
        {label}
      </span>
      <div className={`stat-bar-container flex-1 stat-bar-${type}`}>
        <div
          className="stat-bar-fill"
          style={{ '--fill-width': `${value}%` } as React.CSSProperties}
        />
      </div>
      <span className="text-gray-400 text-[10px] font-mono w-6 text-right">{value}</span>
    </div>
  )

  return (
    <div
      className={`game-card ${tier.glowClass} border-2 ${tier.borderClass} p-5 group`}
    >
      {/* ── Top Row: Rank Badge + ID ── */}
      <div className="flex justify-between items-start mb-4">
        <span className={tier.badgeClass}>{tier.label}</span>
        <div className="flex items-center gap-2">
          {rank && (
            <span className="text-gray-600 text-xs font-mono">
              #{rank}
            </span>
          )}
          <span className="text-gray-700 text-[10px] font-mono">ID:{agent.id}</span>
        </div>
      </div>

      {/* ── Avatar ── */}
      <div className="text-center mb-4">
        <div
          className="agent-avatar large mx-auto group-hover:scale-110 transition-transform duration-300"
          style={{ background: tier.avatarBg }}
        >
          <span className="relative z-10 text-3xl">{agent.avatar || '🤖'}</span>
        </div>
      </div>

      {/* ── Name + Owner ── */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
          {agent.name}
        </h3>
        <p className="text-gray-600 text-xs font-mono mt-1">{truncate(agent.owner)}</p>
      </div>

      {/* ── Power Level ── */}
      <div className="text-center mb-4">
        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Power Level</span>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span
            className={`text-xl font-bold font-mono ${
              powerLevel >= 320
                ? 'gradient-text-gold'
                : powerLevel >= 280
                ? 'text-cyan-400'
                : powerLevel >= 240
                ? 'text-yellow-400'
                : 'text-gray-400'
            }`}
          >
            {powerLevel}
          </span>
          <span className="text-gray-600 text-xs">/400</span>
        </div>
      </div>

      {/* ── Stat Bars ── */}
      <div className="space-y-2 mb-4">
        <StatBar label="STR" value={strength} type="str" icon="💪" />
        <StatBar label="SPD" value={speed} type="spd" icon="⚡" />
        <StatBar label="STR" value={strategy} type="strat" icon="🧠" />
        <StatBar label="LCK" value={luck} type="lck" icon="🍀" />
      </div>

      {/* ── W/L Stats ── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/20 rounded-xl p-2 text-center border border-white/5">
          <div className="text-green-400 font-bold text-lg">{wins}</div>
          <div className="text-gray-600 text-[10px] uppercase tracking-wider">Wins</div>
        </div>
        <div className="bg-black/20 rounded-xl p-2 text-center border border-white/5">
          <div className="text-red-400 font-bold text-lg">{losses}</div>
          <div className="text-gray-600 text-[10px] uppercase tracking-wider">Losses</div>
        </div>
        <div className="bg-black/20 rounded-xl p-2 text-center border border-white/5">
          <div
            className={`font-bold text-lg ${
              winRate >= 60
                ? 'text-green-400'
                : winRate >= 40
                ? 'text-yellow-400'
                : winRate > 0
                ? 'text-red-400'
                : 'text-gray-500'
            }`}
          >
            {winRate}%
          </div>
          <div className="text-gray-600 text-[10px] uppercase tracking-wider">Rate</div>
        </div>
      </div>

      {/* ── Win Rate Bar ── */}
      <div className="mb-4">
        <div className="stat-bar-container large">
          <div
            className="stat-bar-fill"
            style={{
              '--fill-width': `${Math.max(winRate, 3)}%`,
              background:
                winRate >= 60
                  ? 'linear-gradient(90deg, #22c55e, #10b981)'
                  : winRate >= 40
                  ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                  : winRate > 0
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : '#374151',
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* ── Footer: Battles + Status ── */}
      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        <span className="text-gray-500 text-xs font-mono">
          ⚔️ {total} battle{total !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              agent.isActive !== false
                ? 'bg-green-400 pulse-ring-green'
                : 'bg-gray-600'
            }`}
          />
          <span
            className={
              agent.isActive !== false ? 'text-green-400' : 'text-gray-600'
            }
          >
            {agent.isActive !== false ? 'Active' : 'Inactive'}
          </span>
        </span>
      </div>
    </div>
  )
}