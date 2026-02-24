export default function StatCard({
  title,
  value,
  icon,
  color = 'purple',
  change,
}: {
  title: string
  value: string | number
  icon?: string
  color?: 'purple' | 'cyan' | 'gold' | 'red' | 'green'
  change?: string
}) {
  const colors = {
    purple: { bg: 'from-purple-500/15 to-purple-900/15', border: 'border-purple-500/25', text: 'text-purple-400', glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]' },
    cyan: { bg: 'from-cyan-500/15 to-cyan-900/15', border: 'border-cyan-500/25', text: 'text-cyan-400', glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]' },
    gold: { bg: 'from-yellow-500/15 to-yellow-900/15', border: 'border-yellow-500/25', text: 'text-yellow-400', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
    red: { bg: 'from-red-500/15 to-red-900/15', border: 'border-red-500/25', text: 'text-red-400', glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
    green: { bg: 'from-green-500/15 to-green-900/15', border: 'border-green-500/25', text: 'text-green-400', glow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]' },
  }

  const c = colors[color]

  return (
    <div className={`bg-gradient-to-br ${c.bg} backdrop-blur-sm border ${c.border} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${c.glow} group`}>
      {/* Icon */}
      {icon && (
        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      )}

      {/* Value */}
      <div className={`text-3xl font-bold ${c.text} mb-1 font-mono tracking-tight`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {/* Title */}
      <div className="text-gray-500 text-sm font-medium">{title}</div>

      {/* Optional change indicator */}
      {change && (
        <div className={`mt-2 text-xs font-mono ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </div>
      )}

      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${c.bg} rounded-bl-3xl opacity-30 -z-10`} />
    </div>
  )
}