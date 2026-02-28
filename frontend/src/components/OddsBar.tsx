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
  const yes = Math.max(2, Math.min(98, yesPct))
  const no = noPct !== undefined ? Math.max(2, Math.min(98, noPct)) : 100 - yes

  const heights: Record<string, string> = {
    sm: 'h-2',
    md: 'h-5',
    lg: 'h-8',
  }
  const h = heights[size] || heights.md

  const fontSize: Record<string, string> = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  }
  const fz = fontSize[size] || fontSize.md

  const yesLeading = yes > no
  const noLeading = no > yes
  const tied = yes === no

  return (
    <div className="w-full">
      {/* ── Labels ── */}
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 flex-shrink-0" />
            <span
              className={`text-xs font-bold truncate max-w-[100px] ${
                yesLeading ? 'text-green-400' : 'text-green-400/70'
              }`}
            >
              {yesLabel}
            </span>
            <span
              className={`text-xs font-mono ml-0.5 ${
                yesLeading ? 'text-green-400 font-bold' : 'text-green-400/50'
              }`}
            >
              {yes}%
            </span>
            {yesLeading && !tied && (
              <span className="text-green-400 text-[10px] animate-pulse">▲</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {noLeading && !tied && (
              <span className="text-red-400 text-[10px] animate-pulse">▲</span>
            )}
            <span
              className={`text-xs font-mono mr-0.5 ${
                noLeading ? 'text-red-400 font-bold' : 'text-red-400/50'
              }`}
            >
              {no}%
            </span>
            <span
              className={`text-xs font-bold truncate max-w-[100px] ${
                noLeading ? 'text-red-400' : 'text-red-400/70'
              }`}
            >
              {noLabel}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* ── Bar ── */}
      <div
        className={`${h} rounded-full border border-gray-700/50 relative overflow-hidden flex`}
      >
        {/* Yes side */}
        <div
          className={`${h} rounded-l-full relative overflow-hidden flex items-center justify-center flex-shrink-0 ${
            animated ? 'transition-all duration-700 ease-out' : ''
          }`}
          style={{
            width: `${yes}%`,
            background: yesLeading
              ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.4), rgba(34, 197, 94, 0.6))'
              : 'linear-gradient(90deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.35))',
          }}
        >
          {size !== 'sm' && yes >= 15 && (
            <span className={`${fz} font-bold text-green-300/90 relative z-10`}>
              {yes}%
            </span>
          )}

          {animated && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s infinite',
              }}
            />
          )}
        </div>

        {/* No side */}
        <div
          className={`${h} rounded-r-full relative overflow-hidden flex items-center justify-center flex-shrink-0 ml-auto ${
            animated ? 'transition-all duration-700 ease-out' : ''
          }`}
          style={{
            width: `${no}%`,
            background: noLeading
              ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.4), rgba(239, 68, 68, 0.6))'
              : 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.35))',
          }}
        >
          {size !== 'sm' && no >= 15 && (
            <span className={`${fz} font-bold text-red-300/90 relative z-10`}>
              {no}%
            </span>
          )}

          {animated && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s infinite',
                animationDelay: '1.5s',
              }}
            />
          )}
        </div>

        {/* Center divider */}
        {yes > 5 && no > 5 && (
          <div
            className={`absolute top-0 bottom-0 w-[2px] bg-white/20 z-10 ${
              animated ? 'transition-all duration-700 ease-out' : ''
            }`}
            style={{ left: `${yes}%` }}
          />
        )}
      </div>

      {/* ── Small bar labels ── */}
      {!showLabels && size === 'sm' && (
        <div className="flex justify-between mt-1">
          <span className="text-green-400/60 text-[10px] font-mono">{yes}%</span>
          <span className="text-red-400/60 text-[10px] font-mono">{no}%</span>
        </div>
      )}
    </div>
  )
}