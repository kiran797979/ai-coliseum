import { useState, useEffect } from 'react'

export default function BattleLog({ lines = [], autoPlay = true }: { lines: string[], autoPlay?: boolean }) {
  const [visibleCount, setVisibleCount] = useState(autoPlay ? 0 : lines.length)

  useEffect(() => {
    if (!autoPlay || lines.length === 0) return
    setVisibleCount(0)
    let i = 0
    const timer = setInterval(() => {
      i++
      setVisibleCount(i)
      if (i >= lines.length) clearInterval(timer)
    }, 250)
    return () => clearInterval(timer)
  }, [lines, autoPlay])

  if (!lines || lines.length === 0) {
    return (
      <div className="bg-[#0d1117] rounded-xl border border-gray-800 p-6 text-center">
        <p className="text-gray-600 font-mono text-sm">No battle log available.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden">

      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-gray-800">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-gray-500 text-xs font-mono">combat_log.sh</span>
      </div>

      {/* Log Content */}
      <div className="p-4 max-h-96 overflow-y-auto font-mono text-sm space-y-1">
        {/* Prompt */}
        <div className="text-gray-600 text-xs mb-3">
          $ ./resolve_combat --mode=ai --narrator=deepseek
        </div>

        {lines.slice(0, visibleCount).map((line, i) => {
          // Color code different line types
          let color = 'text-green-400'
          let prefix = '  '

          if (line.includes('Round') || line.includes('round')) {
            color = 'text-yellow-400 font-bold'
            prefix = '\n▸ '
          } else if (line.includes('Winner') || line.includes('winner') || line.includes('🏆')) {
            color = 'text-yellow-300 font-bold'
            prefix = '\n★ '
          } else if (line.includes('critical') || line.includes('Critical') || line.includes('💥')) {
            color = 'text-red-400 font-bold'
            prefix = '  ⚡ '
          } else if (line.includes('dodge') || line.includes('Dodge') || line.includes('miss')) {
            color = 'text-cyan-400'
            prefix = '  ↪ '
          } else if (line.includes('damage') || line.includes('attack') || line.includes('Attack')) {
            color = 'text-green-300'
            prefix = '  → '
          } else if (line.startsWith('⚔️') || line.startsWith('Battle')) {
            color = 'text-purple-400 font-bold'
            prefix = '🏟️ '
          }

          return (
            <div
              key={i}
              className={`${color} leading-relaxed transition-opacity duration-300`}
              style={{
                opacity: 1,
                animation: autoPlay ? `fadeIn 0.3s ease-in` : 'none',
                animationDelay: `${i * 0.05}s`,
                animationFillMode: 'both',
              }}
            >
              {prefix}{line}
            </div>
          )
        })}

        {/* Typing cursor */}
        {autoPlay && visibleCount < lines.length && (
          <div className="text-green-500 animate-pulse">▌</div>
        )}

        {/* Done indicator */}
        {visibleCount >= lines.length && lines.length > 0 && (
          <div className="text-gray-600 text-xs mt-4 pt-3 border-t border-gray-800">
            ✓ Combat resolved • {lines.length} events logged
          </div>
        )}
      </div>

      {/* CSS for fade animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}