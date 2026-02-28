import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAgents, getFights, getMarkets } from '../api/client'
import OddsBar from '../components/OddsBar'

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function useTypingEffect(texts: string[], speed = 80, pause = 2000) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[index]
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setDisplayed(current.slice(0, charIndex + 1))
          if (charIndex + 1 === current.length) {
            setTimeout(() => setDeleting(true), pause)
          } else {
            setCharIndex((c) => c + 1)
          }
        } else {
          setDisplayed(current.slice(0, charIndex))
          if (charIndex === 0) {
            setDeleting(false)
            setIndex((index + 1) % texts.length)
          } else {
            setCharIndex((c) => c - 1)
          }
        }
      },
      deleting ? speed / 2 : speed
    )
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, index, texts, speed, pause])

  return displayed
}

/* ═══════════════════════════════════════════
   PARTICLE CANVAS
   ═══════════════════════════════════════════ */

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
    }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = 800
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#22c55e']

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = a.color
            ctx.globalAlpha = (1 - dist / 120) * 0.15
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ height: 800 }}
    />
  )
}

/* ═══════════════════════════════════════════
   ACTIVITY TICKER
   ═══════════════════════════════════════════ */

function ActivityTicker({
  fights,
  agentMap,
}: {
  fights: any[]
  agentMap: Record<number, string>
}) {
  const getName = (id: number) => agentMap[id] || `Agent #${id}`

  const activities = fights
    .slice(-10)
    .reverse()
    .map((f: any) => {
      if (f.status === 'completed' && f.winner) {
        const loser = f.winner === f.agentA ? f.agentB : f.agentA
        return `🏆 ${getName(f.winner)} defeated ${getName(loser)} — ${f.stakeAmount} MON`
      }
      return `⚔️ ${getName(f.agentA)} challenged ${getName(f.agentB)} — ${f.stakeAmount} MON`
    })

  if (activities.length === 0) return null

  return (
    <div className="ticker-container bg-black/40 border-y border-purple-500/20 py-3 backdrop-blur-sm">
      <div className="ticker-track">
        {[...activities, ...activities].map((a, i) => (
          <span key={i} className="ticker-item">
            {a}
            <span className="text-purple-600 mx-4">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */

function StatCard({
  icon,
  value,
  label,
  suffix = '',
  color,
  delay,
}: {
  icon: string
  value: number
  label: string
  suffix?: string
  color: string
  delay: number
}) {
  const colorMap: Record<string, { card: string; text: string }> = {
    purple: {
      card: 'game-card hover:border-purple-500/50 hover:shadow-glow-purple',
      text: 'text-purple-400',
    },
    red: {
      card: 'game-card hover:border-red-500/50 hover:shadow-glow-red',
      text: 'text-red-400',
    },
    green: {
      card: 'game-card game-card-green hover:shadow-glow-green',
      text: 'text-green-400',
    },
    cyan: {
      card: 'game-card game-card-cyan hover:shadow-glow-cyan',
      text: 'text-cyan-400',
    },
    yellow: {
      card: 'game-card game-card-gold hover:shadow-glow-gold',
      text: 'text-yellow-400',
    },
  }

  const c = colorMap[color] || colorMap.purple

  return (
    <div
      className={`${c.card} p-6 text-center group animate-fade-in-up`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      <div className="text-3xl mb-3 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-300">
        {icon}
      </div>
      <div className={`text-3xl font-bold ${c.text} mb-1 font-mono tabular-nums`}>
        {value}
        {suffix}
      </div>
      <div className="text-gray-500 text-xs uppercase tracking-wider">{label}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN HOME COMPONENT
   ═══════════════════════════════════════════ */

export default function Home() {
  const [stats, setStats] = useState({
    agents: 0,
    fights: 0,
    markets: 0,
    volume: 0,
    completed: 0,
  })
  const [recentFights, setRecentFights] = useState<any[]>([])
  const [openMarkets, setOpenMarkets] = useState<any[]>([])
  const [topAgents, setTopAgents] = useState<any[]>([])
  const [agentMap, setAgentMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [heroVisible, setHeroVisible] = useState(false)

  const typedText = useTypingEffect(
    [
      'Deploy AI Agents. Battle for MON.',
      'Predict Fight Outcomes. Win Rewards.',
      'On-Chain Combat. 1-Second Blocks.',
      'AI Narrates Every Battle Live.',
      'Pokémon meets Polymarket on Monad.',
    ],
    60,
    2500
  )

  const animAgents = useAnimatedCounter(stats.agents)
  const animFights = useAnimatedCounter(stats.fights)
  const animMarkets = useAnimatedCounter(stats.markets)
  const animVolume = useAnimatedCounter(stats.volume)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)

    const load = async () => {
      try {
        const [agentsData, fights, markets] = await Promise.all([
          getAgents(),
          getFights(),
          getMarkets(),
        ])

        // Build agent name map
        const map: Record<number, string> = {}
        ;(agentsData || []).forEach((a: any) => {
          map[a.id] = a.name
        })
        setAgentMap(map)

        // Top agents (sorted by wins)
        const sorted = [...(agentsData || [])].sort(
          (a: any, b: any) => (b.wins || 0) - (a.wins || 0)
        )
        setTopAgents(sorted.slice(0, 6))

        // Volume calc
        const vol = (markets || []).reduce(
          (sum: number, m: any) => sum + parseFloat(m.totalPool || '0'),
          0
        )
        const comp = (fights || []).filter(
          (f: any) => f.status === 'completed'
        ).length

        setStats({
          agents: agentsData?.length || 0,
          fights: fights?.length || 0,
          markets: markets?.length || 0,
          volume: Math.round(vol * 10) / 10,
          completed: comp,
        })

        setRecentFights((fights || []).slice(-6).reverse())
        setOpenMarkets(
          (markets || []).filter((m: any) => m.status === 'open').slice(0, 4)
        )
      } catch (e) {
        console.error('Failed to load home data:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getName = useCallback(
    (id: number) => agentMap[id] || `Agent #${id}`,
    [agentMap]
  )

  return (
    <div className="min-h-screen">
      {/* ══════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════ */}
      <section className="hero-bg relative overflow-hidden" style={{ minHeight: '85vh' }}>
        <Particles />

        {/* Gradient Orbs */}
        <div className="orb orb-purple w-[500px] h-[500px] top-20 left-[10%] animate-float-slow" />
        <div
          className="orb orb-cyan w-[400px] h-[400px] bottom-20 right-[10%] animate-float-medium"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="orb orb-pink w-[300px] h-[300px] top-1/3 right-1/4 animate-float-fast"
          style={{ animationDelay: '3s' }}
        />

        {/* Grid overlay */}
        <div className="grid-overlay" />

        {/* Hero content */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center px-4 transition-all duration-1000 ${
            heroVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
          style={{ minHeight: '85vh' }}
        >
          {/* Live badge */}
          <div className="mb-6 px-4 py-2 glass-card text-purple-400 text-xs font-mono tracking-wider flex items-center gap-2 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full pulse-ring-green" />
            LIVE ON MONAD TESTNET • 1s BLOCKS
          </div>

          {/* Animated swords */}
          <div className="pixel-swords pixel-swords-animated mb-4" />

          {/* Title with glitch effect */}
          <h1 className="mb-6 text-center">
            <span
              className="glitch-text font-px-heading text-4xl md:text-6xl lg:text-7xl gradient-text-rainbow"
              data-text="AI COLISEUM"
            >
              AI COLISEUM
            </span>
          </h1>

          {/* Typing subtitle */}
          <div className="h-10 mb-4 flex items-center">
            <p className="text-lg md:text-2xl text-gray-300 font-light tracking-wide text-center">
              {typedText}
              <span className="animate-pulse text-purple-400 ml-0.5">|</span>
            </p>
          </div>

          {/* Tagline */}
          <p className="text-gray-500 mb-10 text-sm md:text-base max-w-lg text-center">
            The first AI agent battle arena with on-chain prediction markets.
            <br />
            <span className="text-purple-400/70">
              Powered by Monad's 1-second finality.
            </span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              to="/arena"
              className="btn-battle btn-shine group relative px-10 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-glow-purple pulse-ring"
            >
              <span className="relative z-10 flex items-center gap-2">
                ⚔️ Enter Arena
              </span>
            </Link>

            <Link
              to="/markets"
              className="btn-shine group relative px-10 py-4 bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-600 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-glow-cyan"
            >
              <span className="relative z-10 flex items-center gap-2">
                🔮 Bet on Fights
              </span>
            </Link>

            <Link
              to="/agents"
              className="btn-shine px-10 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:border-yellow-500/50 hover:bg-yellow-500/5 hover:shadow-glow-gold"
            >
              <span className="flex items-center gap-2">🤖 Deploy Agent</span>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
            <span className="text-xs font-mono">Scroll Down</span>
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* ══════════ LIVE TICKER ══════════ */}
      <ActivityTicker fights={recentFights} agentMap={agentMap} />

      {/* ══════════ ANIMATED STATS ══════════ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon="🤖" value={animAgents} label="AI Agents" color="purple" delay={0} />
          <StatCard icon="⚔️" value={animFights} label="Total Fights" color="red" delay={0.1} />
          <StatCard icon="✅" value={stats.completed} label="Completed" color="green" delay={0.2} />
          <StatCard icon="🔮" value={animMarkets} label="Markets" color="cyan" delay={0.3} />
          <StatCard
            icon="💰"
            value={animVolume}
            label="Volume"
            suffix=" MON"
            color="yellow"
            delay={0.4}
          />
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3 font-mono">
            THE ARENA AWAITS
          </h2>
          <h3 className="font-px-heading text-sm sm:text-base text-white leading-loose">
            How It Works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              icon: '🤖',
              title: 'Deploy Agent',
              desc: 'Register your AI fighter with randomized STR, SPD, STRAT & LCK stats',
              color: 'purple',
            },
            {
              step: '02',
              icon: '⚔️',
              title: 'Create Challenge',
              desc: 'Pick an opponent and stake MON tokens on the battle outcome',
              color: 'red',
            },
            {
              step: '03',
              icon: '🔮',
              title: 'Bet on Outcomes',
              desc: 'Prediction markets open — bet on who wins. Odds update live',
              color: 'cyan',
            },
            {
              step: '04',
              icon: '🏆',
              title: 'Collect Rewards',
              desc: 'AI narrates combat in 5 rounds. Winners claim the prize pool',
              color: 'yellow',
            },
          ].map((item, i) => {
            const borderColors: Record<string, string> = {
              purple: 'hover:border-purple-500/60 hover:shadow-glow-purple',
              red: 'hover:border-red-500/60 hover:shadow-glow-red',
              cyan: 'hover:border-cyan-500/60 hover:shadow-glow-cyan',
              yellow: 'hover:border-yellow-500/60 hover:shadow-glow-gold',
            }

            return (
              <div
                key={i}
                className="relative group animate-fade-in-up"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationFillMode: 'both',
                }}
              >
                <div
                  className={`game-card ${borderColors[item.color]} p-8 text-center h-full`}
                >
                  {/* Step label */}
                  <div className="text-[10px] text-gray-600 font-mono tracking-[0.5em] mb-3">
                    STEP
                  </div>
                  <div className="text-4xl font-bold text-gray-800 font-mono mb-4">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6">
                    {item.icon}
                  </div>

                  <h3 className="text-white font-bold text-lg mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Connector arrow */}
                {i < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-1 z-20 -translate-y-1/2">
                    <div className="w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rotate-45" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════ RECENT FIGHTS ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="section-header">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-red-400 mb-2 font-mono">
              LIVE COMBAT
            </h2>
            <h3 className="font-px-heading text-xs sm:text-sm text-white">
              🔥 Recent Battles
            </h3>
          </div>
          <div className="section-header-line" />
          <Link
            to="/arena"
            className="btn-shine px-5 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all text-sm font-medium hover:scale-105"
          >
            View All →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="loading-spinner large" />
            <p className="text-gray-500 text-sm mt-4 font-mono">
              Loading battles...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && recentFights.length === 0 && (
          <div className="empty-state game-card p-12">
            <div className="empty-state-icon">🏟️</div>
            <p className="empty-state-title">The Arena is Empty</p>
            <p className="empty-state-text mb-6">
              Be the first warrior to enter combat
            </p>
            <Link
              to="/arena"
              className="btn-battle btn-shine inline-flex px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:scale-105 transition-all hover:shadow-glow-purple"
            >
              ⚔️ Create First Fight
            </Link>
          </div>
        )}

        {/* Fight cards */}
        {!loading && recentFights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentFights.map((fight: any, idx: number) => (
              <Link
                to="/arena"
                key={fight.id}
                className="fight-card group animate-fade-in-up"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  animationFillMode: 'both',
                }}
              >
                {/* Fight header bar */}
                <div
                  className={`px-5 py-2 text-xs font-mono tracking-wider flex justify-between items-center ${
                    fight.status === 'completed'
                      ? 'bg-green-500/10 text-green-400'
                      : fight.status === 'in_progress'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}
                >
                  <span>FIGHT #{fight.id}</span>
                  <div
                    className={`status-badge ${
                      fight.status === 'completed'
                        ? 'completed'
                        : fight.status === 'in_progress'
                        ? 'fighting'
                        : 'open'
                    }`}
                  >
                    <span className="status-dot" />
                    {fight.status === 'completed'
                      ? 'DONE'
                      : fight.status === 'in_progress'
                      ? 'LIVE'
                      : 'OPEN'}
                  </div>
                </div>

                {/* VS Layout */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    {/* Agent A */}
                    <div className="flex-1 text-center">
                      <div
                        className="agent-avatar mx-auto mb-2 group-hover:scale-110 transition-transform"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))',
                        }}
                      >
                        🤖
                      </div>
                      <p
                        className={`font-bold text-sm truncate px-1 ${
                          fight.winner === fight.agentA
                            ? 'text-yellow-400'
                            : 'text-white'
                        }`}
                      >
                        {fight.winner === fight.agentA && '👑 '}
                        {getName(fight.agentA)}
                      </p>
                    </div>

                    {/* VS */}
                    <div className="px-3 flex-shrink-0">
                      <div className="vs-badge text-sm">VS</div>
                    </div>

                    {/* Agent B */}
                    <div className="flex-1 text-center">
                      <div
                        className="agent-avatar mx-auto mb-2 group-hover:scale-110 transition-transform"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))',
                        }}
                      >
                        🤖
                      </div>
                      <p
                        className={`font-bold text-sm truncate px-1 ${
                          fight.winner === fight.agentB
                            ? 'text-yellow-400'
                            : 'text-white'
                        }`}
                      >
                        {fight.winner === fight.agentB && '👑 '}
                        {getName(fight.agentB)}
                      </p>
                    </div>
                  </div>

                  {/* Fight info footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="mon-amount text-yellow-400 text-sm">
                      💰 {fight.stakeAmount}{' '}
                      <span className="mon-symbol">MON</span>
                    </span>
                    <span className="text-purple-400 hover:text-purple-300 text-xs transition-colors">
                      Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ══════════ OPEN MARKETS ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="section-header">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-2 font-mono">
              PREDICTION MARKETS
            </h2>
            <h3 className="font-px-heading text-xs sm:text-sm text-white">
              🔮 Open Markets
            </h3>
          </div>
          <div className="section-header-line" />
          <Link
            to="/markets"
            className="btn-shine px-5 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-medium hover:scale-105"
          >
            View All →
          </Link>
        </div>

        {/* Empty state */}
        {!loading && openMarkets.length === 0 && (
          <div className="empty-state game-card game-card-cyan p-12">
            <div className="empty-state-icon">🔮</div>
            <p className="empty-state-title">No Open Markets</p>
            <p className="empty-state-text mb-6">
              Create a fight first, then open a market for it
            </p>
            <Link
              to="/markets"
              className="btn-shine inline-flex px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold hover:scale-105 transition-all hover:shadow-glow-cyan"
            >
              🔮 Create Market
            </Link>
          </div>
        )}

        {/* Market cards */}
        {openMarkets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {openMarkets.map((market: any, idx: number) => {
              const poolA = parseFloat(market.totalPoolA || '0')
              const poolB = parseFloat(market.totalPoolB || '0')
              const totalPool = poolA + poolB
              const pctA =
                totalPool > 0 ? Math.round((poolA / totalPool) * 100) : 50
              const pctB = 100 - pctA

              return (
                <Link
                  to="/markets"
                  key={market.id}
                  className="game-card game-card-cyan p-5 group animate-fade-in-up"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono text-gray-500">
                      MARKET #{market.id}
                    </span>
                    <div className="status-badge open">
                      <span className="status-dot" />
                      LIVE
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-white font-bold mb-4 text-sm leading-snug">
                    {getName(market.agentA)} vs {getName(market.agentB)}
                  </p>

                  {/* Odds */}
                  <div className="mb-3">
                    <OddsBar
                      yesPct={pctA}
                      noPct={pctB}
                      yesLabel={getName(market.agentA)}
                      noLabel={getName(market.agentB)}
                      size="sm"
                      showLabels={false}
                    />
                    <div className="flex justify-between mt-1.5 text-[10px] font-mono">
                      <span className="text-green-400">
                        {getName(market.agentA)} {pctA}%
                      </span>
                      <span className="text-red-400">
                        {pctB}% {getName(market.agentB)}
                      </span>
                    </div>
                  </div>

                  {/* Pool */}
                  <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                    <span className="mon-amount text-yellow-400/70">
                      Pool: {totalPool.toFixed(1)} MON
                    </span>
                    <span>{totalPool > 0 ? '📊 Active' : '🟡 Awaiting'}</span>
                  </div>

                  {/* CTA */}
                  <div className="btn-shine block w-full text-center py-2.5 bg-cyan-600/15 border border-cyan-700/50 rounded-xl text-cyan-400 hover:bg-cyan-600/25 hover:border-cyan-500/50 transition-all text-sm font-bold">
                    Place Bet →
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ══════════ TOP AGENTS ══════════ */}
      {topAgents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <div className="section-header">
            <div>
              <h2 className="text-sm uppercase tracking-[0.3em] text-yellow-400 mb-2 font-mono">
                CHAMPIONS
              </h2>
              <h3 className="font-px-heading text-xs sm:text-sm text-white">
                🏆 Top Agents
              </h3>
            </div>
            <div className="section-header-line" />
            <Link
              to="/leaderboard"
              className="btn-shine px-5 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-all text-sm font-medium hover:scale-105"
            >
              Leaderboard →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topAgents.map((agent: any, idx: number) => {
              const wr =
                (agent.wins || 0) + (agent.losses || 0) > 0
                  ? Math.round(
                      ((agent.wins || 0) /
                        ((agent.wins || 0) + (agent.losses || 0))) *
                        100
                    )
                  : 0

              return (
                <Link
                  to="/agents"
                  key={agent.id}
                  className="game-card game-card-gold p-4 text-center group animate-fade-in-up"
                  style={{
                    animationDelay: `${idx * 0.08}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Rank number */}
                  {idx < 3 && (
                    <div className="text-xs font-mono text-gray-600 mb-1">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                  )}

                  <div
                    className="agent-avatar mx-auto mb-2 group-hover:scale-110 transition-transform"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                    }}
                  >
                    🤖
                  </div>
                  <p className="text-white font-bold text-xs truncate mb-1">
                    {agent.name}
                  </p>
                  <p className="text-green-400 text-[10px] font-mono">
                    {agent.wins || 0}W-{agent.losses || 0}L
                  </p>
                  <p className="text-gray-500 text-[10px]">{wr}% WR</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ══════════ WHY AI COLISEUM ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3 font-mono">
              BUILT DIFFERENT
            </h2>
            <h3 className="font-px-heading text-xs sm:text-sm text-white">
              ⚡ Why AI Coliseum
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⛓️',
                title: '1-Second Blocks',
                desc: 'Built on Monad — fights resolve instantly. No waiting for confirmations.',
                color: 'text-purple-400',
              },
              {
                icon: '🧠',
                title: 'AI-Powered Combat',
                desc: 'DeepSeek R1 narrates unique multi-round battles. Every fight is different.',
                color: 'text-cyan-400',
              },
              {
                icon: '🔮',
                title: 'Prediction Markets',
                desc: 'Polymarket-style betting on every fight. Proportional payouts from the losing pool.',
                color: 'text-pink-400',
              },
              {
                icon: '💰',
                title: 'Real Stakes',
                desc: 'Wager MON on fights. Smart contracts lock funds and auto-distribute winnings.',
                color: 'text-yellow-400',
              },
              {
                icon: '🔐',
                title: 'Fully On-Chain',
                desc: 'Arena.sol + PredictionMarket.sol handle all fund management trustlessly.',
                color: 'text-green-400',
              },
              {
                icon: '🎮',
                title: 'Pixel Art UI',
                desc: 'Retro gaming aesthetic with glow effects, terminal battle logs, and confetti.',
                color: 'text-orange-400',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 group animate-fade-in-up"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationFillMode: 'both',
                }}
              >
                <div className="text-3xl flex-shrink-0 group-hover:scale-125 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h4 className={`font-bold mb-1 ${feature.color}`}>
                    {feature.title}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BOTTOM CTA ══════════ */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="relative glass-card p-10 md:p-16 text-center overflow-hidden border-purple-500/20">
          {/* BG orbs */}
          <div className="orb orb-purple w-64 h-64 top-0 left-0" />
          <div className="orb orb-cyan w-64 h-64 bottom-0 right-0" />

          <div className="relative z-10">
            <div className="pixel-swords pixel-swords-animated mb-6" />

            <h2 className="font-px-heading text-sm sm:text-base text-white mb-4 leading-loose">
              Ready to Battle?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
              Deploy your AI agent, challenge opponents, and earn MON on the
              fastest chain in crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/agents"
                className="btn-battle btn-shine px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl font-bold text-lg text-white hover:scale-105 transition-all hover:shadow-glow-purple"
              >
                🤖 Deploy Your Agent
              </Link>
              <Link
                to="/leaderboard"
                className="btn-shine px-10 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg text-white hover:border-yellow-500/50 hover:scale-105 transition-all"
              >
                🏆 View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-gray-800/50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <span className="font-px-heading text-[0.6rem] text-white">
                AI COLISEUM
              </span>
              <span className="tag green">v1.0</span>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <Link to="/arena" className="nav-link">
                Arena
              </Link>
              <Link to="/agents" className="nav-link">
                Agents
              </Link>
              <Link to="/markets" className="nav-link">
                Markets
              </Link>
              <Link to="/leaderboard" className="nav-link">
                Leaderboard
              </Link>
            </div>

            {/* Chain info */}
            <div className="flex items-center gap-4 text-gray-600 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full pulse-ring-green" />
                Monad Testnet
              </span>
              <span>•</span>
              <span className="font-mono">Chain ID: 10143</span>
            </div>
          </div>

          <hr className="divider-glow my-6" />

          <div className="text-center text-gray-700 text-xs">
            Built for Monad Blitz Hackathon 2026 • AI-Powered Combat •
            On-Chain Prediction Markets
          </div>
        </div>
      </footer>
    </div>
  )
}