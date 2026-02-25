import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAgents, getFights, getMarkets } from '../api/client'

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

/* ─── Typing Effect Hook ─── */
function useTypingEffect(texts: string[], speed = 80, pause = 2000) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[index]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayed(current.slice(0, charIndex + 1))
        if (charIndex + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause)
        } else {
          setCharIndex(c => c + 1)
        }
      } else {
        setDisplayed(current.slice(0, charIndex))
        if (charIndex === 0) {
          setDeleting(false)
          setIndex((index + 1) % texts.length)
        } else {
          setCharIndex(c => c - 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, index, texts, speed, pause])

  return displayed
}

/* ─── Floating Particles ─── */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = []

    const resize = () => { canvas.width = window.innerWidth; canvas.height = 800 }
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
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
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

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y
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
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ height: 800 }} />
}

/* ─── Glitch Text Component ─── */
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 z-0 opacity-80" style={{
        color: '#06b6d4', clipPath: 'inset(0 0 65% 0)', transform: 'translate(-2px, -1px)',
        animation: 'glitch1 2.5s infinite linear alternate-reverse',
      }}>{text}</span>
      <span className="absolute top-0 left-0 z-0 opacity-80" style={{
        color: '#ec4899', clipPath: 'inset(65% 0 0 0)', transform: 'translate(2px, 1px)',
        animation: 'glitch2 3s infinite linear alternate-reverse',
      }}>{text}</span>
    </span>
  )
}

/* ─── Live Activity Ticker ─── */
function ActivityTicker({ fights, agentMap }: { fights: any[]; agentMap: Record<number, string> }) {
  const getName = (id: number) => agentMap[id] || `Agent #${id}`
  const activities = fights.slice(-10).reverse().map((f: any) => {
    if (f.status === 'completed' && f.winner) {
      return `🏆 ${getName(f.winner)} won against ${getName(f.winner === f.agentA ? f.agentB : f.agentA)} — ${f.stakeAmount} MON`
    }
    return `⚔️ ${getName(f.agentA)} challenged ${getName(f.agentB)} — ${f.stakeAmount} MON`
  })

  if (activities.length === 0) return null

  return (
    <div className="overflow-hidden bg-black/40 border-y border-purple-500/20 py-3 backdrop-blur-sm">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...activities, ...activities].map((a, i) => (
          <span key={i} className="mx-8 text-sm text-gray-400">
            {a}
            <span className="mx-8 text-purple-600">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
/* ═══════════════════════════════════════════════════════ */

export default function Home() {
  const [stats, setStats] = useState({ agents: 0, fights: 0, markets: 0, volume: 0, completed: 0 })
  const [recentFights, setRecentFights] = useState<any[]>([])
  const [openMarkets, setOpenMarkets] = useState<any[]>([])
  const [agents, setAgentsList] = useState<any[]>([])
  const [agentMap, setAgentMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [heroVisible, setHeroVisible] = useState(false)

  const typedText = useTypingEffect([
    'Deploy AI Agents. Battle for MON.',
    'Predict Fight Outcomes. Win Rewards.',
    'On-Chain Combat. 1-Second Blocks.',
    'AI Narrates Every Battle Live.',
  ], 60, 2500)

  const animAgents = useAnimatedCounter(stats.agents)
  const animFights = useAnimatedCounter(stats.fights)
  const animMarkets = useAnimatedCounter(stats.markets)
  const animVolume = useAnimatedCounter(stats.volume)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    const load = async () => {
      try {
        const [agentsData, fights, markets] = await Promise.all([getAgents(), getFights(), getMarkets()])
        const map: Record<number, string> = {}
        ;(agentsData || []).forEach((a: any) => { map[a.id] = a.name })
        setAgentMap(map)
        setAgentsList((agentsData || []).slice(0, 6))
        const vol = (markets || []).reduce((sum: number, m: any) => sum + parseFloat(m.totalPool || '0'), 0)
        const comp = (fights || []).filter((f: any) => f.status === 'completed').length
        setStats({
          agents: agentsData?.length || 0,
          fights: fights?.length || 0,
          markets: markets?.length || 0,
          volume: Math.round(vol * 10) / 10,
          completed: comp,
        })
        setRecentFights((fights || []).slice(-6).reverse())
        setOpenMarkets((markets || []).filter((m: any) => m.status === 'open').slice(0, 4))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const getName = useCallback((id: number) => agentMap[id] || `Agent #${id}`, [agentMap])

  return (
    <div className="min-h-screen">

      {/* ═══ CSS Animations ═══ */}
      <style>{`
        @keyframes glitch1 {
          0%, 100% { transform: translate(-2px, -1px); }
          25% { transform: translate(2px, 1px); }
          50% { transform: translate(-1px, 2px); }
          75% { transform: translate(1px, -2px); }
        }
        @keyframes glitch2 {
          0%, 100% { transform: translate(2px, 1px); }
          25% { transform: translate(-2px, -1px); }
          50% { transform: translate(1px, -2px); }
          75% { transform: translate(-1px, 2px); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 30s linear infinite; }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-up { animation: float-up 0.8s ease-out forwards; }
        @keyframes sword-clash {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.1); }
          50% { transform: rotate(15deg) scale(1.2); filter: brightness(1.5); }
          75% { transform: rotate(-5deg) scale(1.05); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
        <Particles />

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className={`relative z-10 flex flex-col items-center justify-center px-4 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ minHeight: '85vh' }}>

          {/* Badge */}
          <div className="mb-6 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-mono tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            LIVE ON MONAD TESTNET • 1s BLOCKS
          </div>

          {/* Sword Animation */}
          <div className="text-7xl md:text-8xl mb-6" style={{ animation: 'sword-clash 3s ease-in-out infinite' }}>
            ⚔️
          </div>

          {/* Title with Glitch */}
          <h1 className="mb-6 text-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            <GlitchText
              text="AI COLISEUM"
              className="text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            />
          </h1>

          {/* Typing Subtitle */}
          <div className="h-10 mb-4 flex items-center">
            <p className="text-lg md:text-2xl text-gray-300 font-light tracking-wide text-center">
              {typedText}<span className="animate-pulse text-purple-400">|</span>
            </p>
          </div>

          {/* Sub-subtitle */}
          <p className="text-gray-500 mb-10 text-sm md:text-base max-w-lg text-center">
            The first AI agent battle arena with on-chain prediction markets.
            <br />
            <span className="text-purple-400/70">Powered by Monad's 1-second finality.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link to="/arena"
              className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] animate-pulse-ring overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">⚔️ Enter Arena</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient" />
              {/* Shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent" style={{ animation: 'shimmer 1.5s infinite' }} />
              </div>
            </Link>

            <Link to="/markets"
              className="group relative px-10 py-4 bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-600 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">🔮 Bet on Fights</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-gradient" />
            </Link>

            <Link to="/agents"
              className="group px-10 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:border-yellow-500/50 hover:bg-yellow-500/5 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <span className="flex items-center gap-2">🤖 Deploy Agent</span>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
            <span className="text-xs">Scroll Down</span>
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* ══════════ LIVE ACTIVITY TICKER ══════════ */}
      <ActivityTicker fights={recentFights} agentMap={agentMap} />

      {/* ══════════ ANIMATED STATS ══════════ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'AI Agents', value: animAgents, icon: '🤖', color: 'purple', suffix: '' },
            { label: 'Total Fights', value: animFights, icon: '⚔️', color: 'red', suffix: '' },
            { label: 'Completed', value: stats.completed, icon: '✅', color: 'green', suffix: '' },
            { label: 'Markets', value: animMarkets, icon: '🔮', color: 'cyan', suffix: '' },
            { label: 'Volume', value: animVolume, icon: '💰', color: 'yellow', suffix: ' MON', span: true },
          ].map((stat, i) => {
            const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
              purple: { bg: 'from-purple-500/10 to-purple-900/20', border: 'border-purple-500/20 hover:border-purple-500/50', text: 'text-purple-400', glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]' },
              red: { bg: 'from-red-500/10 to-red-900/20', border: 'border-red-500/20 hover:border-red-500/50', text: 'text-red-400', glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]' },
              green: { bg: 'from-green-500/10 to-green-900/20', border: 'border-green-500/20 hover:border-green-500/50', text: 'text-green-400', glow: 'group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]' },
              cyan: { bg: 'from-cyan-500/10 to-cyan-900/20', border: 'border-cyan-500/20 hover:border-cyan-500/50', text: 'text-cyan-400', glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]' },
              yellow: { bg: 'from-yellow-500/10 to-yellow-900/20', border: 'border-yellow-500/20 hover:border-yellow-500/50', text: 'text-yellow-400', glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]' },
            }
            const c = colors[stat.color]
            return (
              <div key={i}
                className={`group bg-gradient-to-br ${c.bg} backdrop-blur-sm border ${c.border} rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 ${c.glow} ${stat.span ? 'col-span-2 md:col-span-1' : ''}`}
                style={{ animation: `float-up 0.6s ease-out ${i * 0.1}s both` }}>
                <div className="text-3xl mb-3 transition-transform group-hover:scale-125 group-hover:rotate-12">{stat.icon}</div>
                <div className={`text-3xl font-bold ${c.text} mb-1 font-mono tabular-nums`}>
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS — ENHANCED ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3 font-mono">THE ARENA AWAITS</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', lineHeight: '2' }}>
            How It Works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {[
            { step: '01', icon: '🤖', title: 'Deploy Agent', desc: 'Register your AI fighter with randomized STR, SPD, STRAT & LCK stats', color: 'purple' },
            { step: '02', icon: '⚔️', title: 'Create Challenge', desc: 'Pick an opponent and stake MON tokens on the battle outcome', color: 'red' },
            { step: '03', icon: '🔮', title: 'Bet on Outcomes', desc: 'Prediction markets open — bet on who wins. Odds update live', color: 'cyan' },
            { step: '04', icon: '🏆', title: 'Collect Rewards', desc: 'AI narrates combat in 5 rounds. Winners claim the prize pool', color: 'yellow' },
          ].map((item, i) => {
            const accents: Record<string, string> = {
              purple: 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
              red: 'border-red-500/30 hover:border-red-500/60 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]',
              cyan: 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
              yellow: 'border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
            }
            return (
              <div key={i} className="relative group" style={{ animation: `float-up 0.6s ease-out ${i * 0.15}s both` }}>
                <div className={`bg-gray-900/60 backdrop-blur-sm border ${accents[item.color]} rounded-2xl p-8 text-center transition-all duration-500 hover:-translate-y-3 mx-2 h-full`}>
                  {/* Step number */}
                  <div className="text-[10px] text-gray-600 font-mono tracking-[0.5em] mb-4">STEP</div>
                  <div className="text-4xl font-bold text-gray-800 font-mono mb-4">{item.step}</div>

                  {/* Icon */}
                  <div className="text-5xl mb-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 group-hover:drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                    {item.icon}
                  </div>

                  <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
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

      {/* ══════════ RECENT FIGHTS — ENHANCED ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-red-400 mb-2 font-mono">LIVE COMBAT</h2>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1rem' }}>
              🔥 Recent Battles
            </h3>
          </div>
          <Link to="/arena" className="px-5 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all text-sm font-medium hover:scale-105">
            View All →
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Loading battles...
            </div>
          </div>
        )}

        {!loading && recentFights.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-800 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-4">🏟️</div>
            <p className="text-gray-400 text-lg mb-2">The Arena is Empty</p>
            <p className="text-gray-600 mb-6 text-sm">Be the first warrior to enter combat</p>
            <Link to="/arena" className="inline-flex px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:scale-105 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              ⚔️ Create First Fight
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentFights.map((fight: any, idx: number) => (
            <div key={fight.id}
              className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-2 hover:shadow-[0_15px_50px_rgba(139,92,246,0.15)]"
              style={{ animation: `float-up 0.5s ease-out ${idx * 0.1}s both` }}>

              {/* Fight header */}
              <div className={`px-5 py-2 text-xs font-mono tracking-wider flex justify-between items-center ${
                fight.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                fight.status === 'in_progress' ? 'bg-red-500/10 text-red-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                <span>FIGHT #{fight.id}</span>
                <span className="flex items-center gap-1.5">
                  {fight.status === 'completed' && '✅ Finished'}
                  {fight.status === 'in_progress' && <><span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />LIVE</>}
                  {fight.status === 'pending' && '🟡 Open'}
                </span>
              </div>

              {/* VS Layout */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-900/20 border border-purple-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🤖
                    </div>
                    <p className={`font-bold text-sm truncate px-1 ${fight.winner === fight.agentA ? 'text-yellow-400' : 'text-white'}`}>
                      {fight.winner === fight.agentA && '👑 '}
                      {getName(fight.agentA)}
                    </p>
                  </div>

                  <div className="px-3 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-xs font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-shadow">
                      VS
                    </div>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🤖
                    </div>
                    <p className={`font-bold text-sm truncate px-1 ${fight.winner === fight.agentB ? 'text-yellow-400' : 'text-white'}`}>
                      {fight.winner === fight.agentB && '👑 '}
                      {getName(fight.agentB)}
                    </p>
                  </div>
                </div>

                {/* Fight info */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                  <span className="text-yellow-400 font-mono text-sm font-bold">💰 {fight.stakeAmount} MON</span>
                  <Link to="/arena" className="text-purple-400 hover:text-purple-300 text-xs transition-colors">
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ OPEN MARKETS — ENHANCED ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-2 font-mono">PREDICTION MARKETS</h2>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1rem' }}>
              🔮 Open Markets
            </h3>
          </div>
          <Link to="/markets" className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-medium hover:scale-105">
            View All →
          </Link>
        </div>

        {!loading && openMarkets.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-800 rounded-2xl">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-gray-400 text-lg mb-2">No Open Markets</p>
            <p className="text-gray-600 mb-6 text-sm">Create a fight first, then open a market for it</p>
            <Link to="/markets" className="inline-flex px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold hover:scale-105 transition-all">
              🔮 Create Market
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {openMarkets.map((market: any, idx: number) => {
            const poolA = parseFloat(market.totalPoolA || '0')
            const poolB = parseFloat(market.totalPoolB || '0')
            const total = poolA + poolB
            const pctA = total > 0 ? Math.round((poolA / total) * 100) : 50
            const pctB = 100 - pctA
            return (
              <div key={market.id}
                className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-5 transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-2 hover:shadow-[0_15px_50px_rgba(6,182,212,0.15)]"
                style={{ animation: `float-up 0.5s ease-out ${idx * 0.1}s both` }}>

                {/* Market badge */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono text-gray-500">MARKET #{market.id}</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" /> LIVE
                  </span>
                </div>

                <p className="text-white font-bold mb-4 text-sm leading-snug">
                  {getName(market.agentA)} vs {getName(market.agentB)}
                </p>

                {/* Odds Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-green-400 font-mono">{getName(market.agentA)} {pctA}%</span>
                    <span className="text-red-400 font-mono">{pctB}% {getName(market.agentB)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 rounded-l-full" style={{ width: `${pctA}%` }} />
                    <div className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500 rounded-r-full" style={{ width: `${pctB}%` }} />
                  </div>
                </div>

                {/* Pool info */}
                <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                  <span>Pool: {total.toFixed(1)} MON</span>
                  <span>{(poolA + poolB > 0) ? '📊 Active' : '🟡 Awaiting bets'}</span>
                </div>

                <Link to="/markets"
                  className="block w-full text-center py-2.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-700/50 rounded-xl text-cyan-400 hover:bg-cyan-600/30 hover:border-cyan-500/50 transition-all text-sm font-bold group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  Place Bet →
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════ TOP AGENTS PREVIEW ══════════ */}
      {agents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-sm uppercase tracking-[0.3em] text-yellow-400 mb-2 font-mono">CHAMPIONS</h2>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1rem' }}>
                🏆 Top Agents
              </h3>
            </div>
            <Link to="/leaderboard" className="px-5 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-all text-sm font-medium hover:scale-105">
              Leaderboard →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {agents.map((agent: any, idx: number) => {
              const winRate = agent.total_battles > 0 ? Math.round((agent.wins / agent.total_battles) * 100) : 0
              return (
                <div key={agent.id}
                  className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-xl p-4 text-center transition-all duration-300 hover:border-yellow-500/40 hover:-translate-y-2"
                  style={{ animation: `float-up 0.5s ease-out ${idx * 0.08}s both` }}>
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <p className="text-white font-bold text-xs truncate mb-1">{agent.name}</p>
                  <p className="text-green-400 text-[10px] font-mono">{agent.wins}W-{agent.losses}L</p>
                  <p className="text-gray-500 text-[10px]">{winRate}% WR</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ══════════ TECH STACK / FEATURES ══════════ */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border border-gray-800 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3 font-mono">BUILT DIFFERENT</h2>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1rem' }}>
              ⚡ Why AI Coliseum
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⛓️', title: '1-Second Blocks', desc: 'Built on Monad — fights resolve instantly. No waiting for confirmations.', highlight: 'text-purple-400' },
              { icon: '🧠', title: 'AI-Powered Combat', desc: 'DeepSeek R1 narrates unique multi-round battles. Every fight is different.', highlight: 'text-cyan-400' },
              { icon: '🔮', title: 'Prediction Markets', desc: 'Polymarket-style betting on every fight. Proportional payouts from the losing pool.', highlight: 'text-pink-400' },
              { icon: '💰', title: 'Real Stakes', desc: 'Wager MON on fights. Smart contracts lock funds and auto-distribute winnings.', highlight: 'text-yellow-400' },
              { icon: '🔐', title: 'Fully On-Chain', desc: 'Arena.sol + PredictionMarket.sol handle all fund management trustlessly.', highlight: 'text-green-400' },
              { icon: '🎮', title: 'Pixel Art UI', desc: 'Retro gaming aesthetic with glass morphism, glow effects and terminal battle logs.', highlight: 'text-orange-400' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 group" style={{ animation: `float-up 0.5s ease-out ${i * 0.1}s both` }}>
                <div className="text-3xl flex-shrink-0 group-hover:scale-125 transition-transform">{feature.icon}</div>
                <div>
                  <h4 className={`font-bold mb-1 ${feature.highlight}`}>{feature.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BOTTOM CTA ══════════ */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="relative bg-gradient-to-r from-purple-900/50 via-pink-900/30 to-cyan-900/50 border border-purple-500/20 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
          {/* BG effects */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <div className="text-5xl mb-6" style={{ animation: 'sword-clash 2s ease-in-out infinite' }}>⚔️</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 'clamp(1rem, 3vw, 1.5rem)', lineHeight: '2' }}>
              Ready to Battle?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
              Deploy your AI agent, challenge opponents, and earn MON on the fastest chain in crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/agents"
                className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl font-bold text-lg text-white hover:scale-105 transition-all hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] animate-gradient">
                🤖 Deploy Your Agent
              </Link>
              <Link to="/leaderboard"
                className="px-10 py-4 bg-gray-800/80 border border-gray-600 rounded-xl font-bold text-lg text-white hover:border-yellow-500/50 hover:scale-105 transition-all">
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
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <span className="font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.65rem' }}>
                AI COLISEUM
              </span>
              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-[10px] font-mono">
                v1.0
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <Link to="/arena" className="hover:text-purple-400 transition-colors">Arena</Link>
              <Link to="/agents" className="hover:text-purple-400 transition-colors">Agents</Link>
              <Link to="/markets" className="hover:text-purple-400 transition-colors">Markets</Link>
              <Link to="/leaderboard" className="hover:text-purple-400 transition-colors">Leaderboard</Link>
            </div>

            <div className="flex items-center gap-4 text-gray-600 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Monad Testnet
              </span>
              <span>•</span>
              <span>Chain ID: 10143</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800/50 text-center text-gray-700 text-xs">
            Built for Monad Blitz Hackathon 2025 • AI-Powered Combat • On-Chain Prediction Markets
          </div>
        </div>
      </footer>
    </div>
  )
}