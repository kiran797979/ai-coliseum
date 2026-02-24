export default function OddsBar({
  yesPct,
  noPct,
  yesLabel = 'Agent A',
  noLabel = 'Agent B',
  size = 'md',
  showLabels = true,
  animated = true,
}: {
  yesPct: number
  noPct?: number
  yesLabel?: string
  noLabel?: string
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  animated?: boolean
}) {
  const yes = Math.max(0, Math.min(100, yesPct))
  const no = noPct !== undefined ? Math.max(0, Math.min(100, noPct)) : 100 - yes

  const heights = { sm: 'h-2', md: 'h-4', lg: 'h-6' }
  const h = heights[size]

  return (
    <div className="w-full">
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400" />
            <span className="text-green-400 text-xs font-bold">{yesLabel}</span>
            <span className="text-green-400/70 text-xs font-mono ml-1">{yes}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400/70 text-xs font-mono mr-1">{no}%</span>
            <span className="text-red-400 text-xs font-bold">{noLabel}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-400" />
          </div>
        </div>
      )}

      {/* Bar */}
      <div className={`w-full ${h} rounded-full overflow-hidden flex bg-gray-800/80 border border-gray-700/50 relative`}>
        {/* Yes side */}
        <div
          className={`${h} bg-gradient-to-r from-green-500 to-emerald-400 rounded-l-full relative overflow-hidden ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
          style={{ width: `${yes}%` }}
        >
          {/* Shimmer effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]"
              style={{ backgroundSize: '200% 100%' }}
            />
          )}
        </div>

        {/* No side */}
        <div
          className={`${h} bg-gradient-to-r from-red-500 to-rose-600 rounded-r-full ml-auto relative overflow-hidden ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
          style={{ width: `${no}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]"
              style={{ backgroundSize: '200% 100%', animationDelay: '1.5s' }}
            />
          )}
        </div>

        {/* Center divider */}
        {yes > 5 && no > 5 && (
          <div className="absolute top-0 bottom-0 bg-gray-900 w-[2px]" style={{ left: `${yes}%` }} />
        )}
      </div>

      {/* Percentage text below for small bars */}
      {!showLabels && size === 'sm' && (
        <div className="flex justify-between mt-1">
          <span className="text-green-400/60 text-[10px] font-mono">{yes}%</span>
          <span className="text-red-400/60 text-[10px] font-mono">{no}%</span>
        </div>
      )}
    </div>
  )
}