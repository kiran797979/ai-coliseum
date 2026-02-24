export default function PixelBorder({
  children,
  color = 'purple',
  glow = false,
  hover = true,
  className = '',
}: {
  children: any
  color?: 'purple' | 'cyan' | 'gold' | 'red' | 'green'
  glow?: boolean
  hover?: boolean
  className?: string
}) {
  const colors = {
    purple: {
      border: 'border-purple-500/40',
      shadow: 'shadow-[4px_0_0_0_rgba(139,92,246,0.4),-4px_0_0_0_rgba(139,92,246,0.4),0_4px_0_0_rgba(139,92,246,0.4),0_-4px_0_0_rgba(139,92,246,0.4)]',
      hoverBorder: 'hover:border-purple-400/60',
      hoverGlow: 'hover:shadow-[4px_0_0_0_rgba(139,92,246,0.6),-4px_0_0_0_rgba(139,92,246,0.6),0_4px_0_0_rgba(139,92,246,0.6),0_-4px_0_0_rgba(139,92,246,0.6),0_0_20px_rgba(139,92,246,0.2)]',
      bg: 'from-purple-900/20 to-gray-900/80',
    },
    cyan: {
      border: 'border-cyan-500/40',
      shadow: 'shadow-[4px_0_0_0_rgba(6,182,212,0.4),-4px_0_0_0_rgba(6,182,212,0.4),0_4px_0_0_rgba(6,182,212,0.4),0_-4px_0_0_rgba(6,182,212,0.4)]',
      hoverBorder: 'hover:border-cyan-400/60',
      hoverGlow: 'hover:shadow-[4px_0_0_0_rgba(6,182,212,0.6),-4px_0_0_0_rgba(6,182,212,0.6),0_4px_0_0_rgba(6,182,212,0.6),0_-4px_0_0_rgba(6,182,212,0.6),0_0_20px_rgba(6,182,212,0.2)]',
      bg: 'from-cyan-900/20 to-gray-900/80',
    },
    gold: {
      border: 'border-yellow-500/40',
      shadow: 'shadow-[4px_0_0_0_rgba(234,179,8,0.4),-4px_0_0_0_rgba(234,179,8,0.4),0_4px_0_0_rgba(234,179,8,0.4),0_-4px_0_0_rgba(234,179,8,0.4)]',
      hoverBorder: 'hover:border-yellow-400/60',
      hoverGlow: 'hover:shadow-[4px_0_0_0_rgba(234,179,8,0.6),-4px_0_0_0_rgba(234,179,8,0.6),0_4px_0_0_rgba(234,179,8,0.6),0_-4px_0_0_rgba(234,179,8,0.6),0_0_20px_rgba(234,179,8,0.2)]',
      bg: 'from-yellow-900/20 to-gray-900/80',
    },
    red: {
      border: 'border-red-500/40',
      shadow: 'shadow-[4px_0_0_0_rgba(239,68,68,0.4),-4px_0_0_0_rgba(239,68,68,0.4),0_4px_0_0_rgba(239,68,68,0.4),0_-4px_0_0_rgba(239,68,68,0.4)]',
      hoverBorder: 'hover:border-red-400/60',
      hoverGlow: 'hover:shadow-[4px_0_0_0_rgba(239,68,68,0.6),-4px_0_0_0_rgba(239,68,68,0.6),0_4px_0_0_rgba(239,68,68,0.6),0_-4px_0_0_rgba(239,68,68,0.6),0_0_20px_rgba(239,68,68,0.2)]',
      bg: 'from-red-900/20 to-gray-900/80',
    },
    green: {
      border: 'border-green-500/40',
      shadow: 'shadow-[4px_0_0_0_rgba(34,197,94,0.4),-4px_0_0_0_rgba(34,197,94,0.4),0_4px_0_0_rgba(34,197,94,0.4),0_-4px_0_0_rgba(34,197,94,0.4)]',
      hoverBorder: 'hover:border-green-400/60',
      hoverGlow: 'hover:shadow-[4px_0_0_0_rgba(34,197,94,0.6),-4px_0_0_0_rgba(34,197,94,0.6),0_4px_0_0_rgba(34,197,94,0.6),0_-4px_0_0_rgba(34,197,94,0.6),0_0_20px_rgba(34,197,94,0.2)]',
      bg: 'from-green-900/20 to-gray-900/80',
    },
  }

  const c = colors[color]

  return (
    <div
      className={`
        bg-gradient-to-br ${c.bg}
        border-2 ${c.border}
        ${glow ? c.shadow : ''}
        rounded-xl p-5
        transition-all duration-300
        ${hover ? `hover:-translate-y-1 ${c.hoverBorder} ${c.hoverGlow}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}