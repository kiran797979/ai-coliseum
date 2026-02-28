import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Line classification ─── */
type LineType = 'system' | 'round' | 'attack' | 'critical' | 'dodge' | 'winner' | 'battle-start' | 'damage' | 'separator' | 'normal'

function classifyLine(line: string): LineType {
  const l = line.toLowerCase()
  if (l.includes('winner') || l.includes('🏆') || l.includes('wins!') || l.includes('champion')) return 'winner'
  if (l.includes('round ') || l.match(/round\s*\d/)) return 'round'
  if (l.includes('critical') || l.includes('💥') || l.includes('devastating')) return 'critical'
  if (l.includes('dodge') || l.includes('evade') || l.includes('miss') || l.includes('↪')) return 'dodge'
  if (l.includes('attack') || l.includes('strike') || l.includes('slash') || l.includes('punch') || l.includes('hit')) return 'attack'
  if (l.includes('damage') || l.includes('hp') || l.includes('health')) return 'damage'
  if (l.startsWith('⚔️') || l.startsWith('battle') || l.includes('begins') || l.includes('🏟️')) return 'battle-start'
  if (l.startsWith('---') || l.startsWith('═══') || l.startsWith('~~~')) return 'separator'
  if (l.startsWith('[') || l.includes('loading') || l.includes('initializ')) return 'system'
  return 'normal'
}

function getLineStyles(type: LineType): { className: string; prefix: string } {
  switch (type) {
    case 'winner':
      return { className: 'terminal-line winner', prefix: '🏆 ' }
    case 'round':
      return { className: 'terminal-line round-header', prefix: '▸ ' }
    case 'critical':
      return { className: 'terminal-line critical', prefix: '⚡ ' }
    case 'dodge':
      return { className: 'terminal-line defend', prefix: '↪ ' }
    case 'attack':
      return { className: 'terminal-line attack', prefix: '→ ' }
    case 'damage':
      return { className: 'terminal-line damage', prefix: '  ' }
    case 'battle-start':
      return { className: 'text-purple-400 font-bold', prefix: '🏟️ ' }
    case 'separator':
      return { className: 'terminal-line separator', prefix: '' }
    case 'system':
      return { className: 'terminal-line system', prefix: '  ' }
    default:
      return { className: 'text-green-400', prefix: '  ' }
  }
}

/* ─── Props ─── */
interface BattleLogProps {
  lines?: string[]
  autoPlay?: boolean
  speed?: number
  onLineReveal?: (index: number, type: LineType) => void
  onComplete?: () => void
}

/* ─── Component ─── */
export default function BattleLog({
  lines = [],
  autoPlay = true,
  speed = 220,
  onLineReveal,
  onComplete,
}: BattleLogProps) {
  const [visibleCount, setVisibleCount] = useState(autoPlay ? 0 : lines.length)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  // Typewriter reveal effect
  useEffect(() => {
    if (!autoPlay || lines.length === 0) {
      setVisibleCount(lines.length)
      return
    }

    setVisibleCount(0)
    let i = 0

    timerRef.current = setInterval(() => {
      i++
      setVisibleCount(i)

      // Classify line for callback
      const line = lines[i - 1]
      if (line) {
        const type = classifyLine(line)
        onLineReveal?.(i - 1, type)
      }

      if (i >= lines.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        onComplete?.()
      }
    }, speed)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [lines, autoPlay, speed, onLineReveal, onComplete])

  // Scroll on new line
  useEffect(() => {
    scrollToBottom()
  }, [visibleCount, scrollToBottom])

  /* ─── Empty state ─── */
  if (!lines || lines.length === 0) {
    return (
      <div className="terminal terminal-scanlines">
        <div className="terminal-header">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
          <span className="terminal-header-title">combat_log.sh</span>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-600 font-mono text-sm">
            Awaiting combat initialization...
          </p>
        </div>
      </div>
    )
  }

  /* ─── Progress ─── */
  const progress = lines.length > 0 ? Math.round((visibleCount / lines.length) * 100) : 0
  const isComplete = visibleCount >= lines.length

  return (
    <div className="terminal terminal-scanlines">
      {/* ── Terminal Header ── */}
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="terminal-header-title">combat_log.sh</span>
        <div className="ml-auto flex items-center gap-2">
          {!isComplete && (
            <span className="text-xs text-gray-600 font-mono">{progress}%</span>
          )}
          {isComplete && (
            <span className="text-xs text-green-600 font-mono">✓ complete</span>
          )}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {!isComplete && autoPlay && (
        <div className="h-0.5 bg-gray-800 -mx-5 mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ── Prompt ── */}
      <div className="text-gray-600 text-xs mb-3 font-mono">
        <span className="text-purple-500">❯</span> ./resolve_combat --mode=ai --narrator=deepseek
      </div>

      {/* ── Log Lines ── */}
      <div ref={scrollRef} className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
        {lines.slice(0, visibleCount).map((line, i) => {
          const type = classifyLine(line)
          const { className, prefix } = getLineStyles(type)
          const isLatest = i === visibleCount - 1 && autoPlay && !isComplete

          return (
            <div
              key={`${i}-${line.slice(0, 20)}`}
              className={`${className} leading-relaxed ${isLatest ? 'animate-fade-in-left' : ''}`}
              style={{
                animation: autoPlay ? 'terminalFadeIn 0.3s ease-in-out' : 'none',
              }}
            >
              {/* Round headers get extra spacing */}
              {type === 'round' && i > 0 && (
                <div className="terminal-line separator text-gray-800 text-xs my-1">
                  ────────────────────────────
                </div>
              )}
              {prefix}{line}
            </div>
          )
        })}

        {/* ── Typing Cursor ── */}
        {autoPlay && !isComplete && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-green-500 animate-pulse text-lg leading-none">▌</span>
            <span className="text-gray-700 text-xs font-mono">processing...</span>
          </div>
        )}
      </div>

      {/* ── Completion Footer ── */}
      {isComplete && lines.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
          <span className="text-gray-600 text-xs font-mono">
            ✓ Combat resolved • {lines.length} events
          </span>
          <span className="text-gray-700 text-xs font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  )
}