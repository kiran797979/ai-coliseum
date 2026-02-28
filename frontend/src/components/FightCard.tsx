import { useState, useEffect, useCallback } from 'react'
import { resolveFight, getAgents } from '../api/client'
import BattleLog from './BattleLog'
import toast from 'react-hot-toast'

/* ─── Lazy-load confetti (avoids build issues) ─── */
function fireConfetti() {
  import('canvas-confetti')
    .then((mod) => {
      const confettiFn = mod.default
      // First burst
      confettiFn({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#8b5cf6', '#06b6d4', '#22c55e', '#ec4899'],
      })
      // Second burst (delayed)
      setTimeout(() => {
        confettiFn({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#ffd700', '#ff6b6b', '#8b5cf6'],
        })
        confettiFn({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#ffd700', '#ff6b6b', '#8b5cf6'],
        })
      }, 300)
    })
    .catch(() => {
      // Confetti not available — silent fail
    })
}

/* ─── Types ─── */
type BattlePhase = 'idle' | 'countdown' | 'fighting' | 'revealing' | 'victory'

interface FightCardProps {
  fight: any
  onResolved?: () => void
}

/* ─── Countdown Overlay ─── */
function CountdownOverlay({
  phase,
  countdownValue,
  agentAName,
  agentBName,
}: {
  phase: BattlePhase
  countdownValue: number | string
  agentAName: string
  agentBName: string
}) {
  if (phase !== 'countdown' && phase !== 'fighting') return null

  return (
    <div className="countdown-overlay">
      {phase === 'countdown' && typeof countdownValue === 'number' && (
        <>
          <div key={countdownValue} className="countdown-number">
            {countdownValue}
          </div>
          <p className="countdown-subtext mt-4">
            {agentAName} vs {agentBName}
          </p>
        </>
      )}
      {phase === 'fighting' && (
        <>
          <div className="countdown-fight">FIGHT!</div>
          <p className="countdown-subtext">⚔️ AI is resolving combat...</p>
        </>
      )}
    </div>
  )
}

/* ─── Main Component ─── */
export default function FightCard({ fight, onResolved }: FightCardProps) {
  const [logOpen, setLogOpen] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [agentMap, setAgentMap] = useState<Record<number, string>>({})
  const [phase, setPhase] = useState<BattlePhase>('idle')
  const [countdownValue, setCountdownValue] = useState(3)
  const [shakeClass, setShakeClass] = useState('')
  const [flashType, setFlashType] = useState<string | null>(null)

  // Load agent names
  useEffect(() => {
    getAgents()
      .then((agents: any[]) => {
        const map: Record<number, string> = {}
        ;(agents || []).forEach((a: any) => {
          map[a.id] = a.name
        })
        setAgentMap(map)
      })
      .catch(() => {})
  }, [])

  const getName = (id: number) => agentMap[id] || `Agent #${id}`

  // Screen shake trigger
  const triggerShake = useCallback((hard = false) => {
    setShakeClass(hard ? 'screen-shake-hard' : 'screen-shake')
    setTimeout(() => setShakeClass(''), hard ? 600 : 500)
  }, [])

  // Flash trigger
  const triggerFlash = useCallback((type: 'damage' | 'critical' | 'victory') => {
    setFlashType(type)
    setTimeout(
      () => setFlashType(null),
      type === 'victory' ? 1000 : type === 'critical' ? 500 : 300
    )
  }, [])

  // Battle log line callback — triggers effects per line type
  const handleLineReveal = useCallback(
    (_index: number, type: string) => {
      if (type === 'critical') {
        triggerShake(true)
        triggerFlash('critical')
      } else if (type === 'attack') {
        triggerShake(false)
        triggerFlash('damage')
      } else if (type === 'winner') {
        triggerFlash('victory')
        fireConfetti()
      }
    },
    [triggerShake, triggerFlash]
  )

  /* ─── Countdown + Resolve Flow ─── */
  const handleResolve = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (resolving) return

    setResolving(true)
    setPhase('countdown')

    // Countdown: 3... 2... 1... FIGHT!
    for (let i = 3; i >= 1; i--) {
      setCountdownValue(i)
      await new Promise<void>((r) => setTimeout(r, 700))
    }

    setPhase('fighting')
    await new Promise<void>((r) => setTimeout(r, 800))

    // Actual API call
    try {
      const res = await resolveFight(fight.id)
      setResult(res)
      setPhase('revealing')

      // Open battle log modal after short delay
      setTimeout(() => {
        setLogOpen(true)
        setPhase('idle')
      }, 400)

      toast.success('⚔️ Fight resolved!')
      onResolved?.()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resolve fight')
      setPhase('idle')
    } finally {
      setResolving(false)
    }
  }

  /* ─── Derived state ─── */
  const isCompleted = fight.status === 'completed'
  const isFighting = fight.status === 'in_progress'
  const battleLog = result?.battleLog || fight.battleLog || []
  const winner = result?.winner || fight.winner
  const reasoning = result?.reasoning || fight.reasoning
  const agentAName = getName(fight.agentA)
  const agentBName = getName(fight.agentB)

  /* ─── Card status class ─── */
  const cardStatusClass = isCompleted
    ? winner
      ? 'fight-card completed has-winner'
      : 'fight-card completed'
    : isFighting
    ? 'fight-card fighting'
    : 'fight-card'

  return (
    <>
      {/* ══ Countdown Overlay ══ */}
      <CountdownOverlay
        phase={phase}
        countdownValue={countdownValue}
        agentAName={agentAName}
        agentBName={agentBName}
      />

      {/* ══ Damage/Critical Flash ══ */}
      {flashType === 'damage' && <div className="damage-flash" />}
      {flashType === 'critical' && <div className="critical-flash" />}
      {flashType === 'victory' && <div className="victory-flash" />}

      {/* ══ Fight Card ══ */}
      <div
        className={`${cardStatusClass} ${shakeClass} p-5 cursor-pointer group hover:-translate-y-1 transition-transform duration-300`}
        onClick={() => battleLog.length > 0 && setLogOpen(true)}
      >
        {/* ── VS Section ── */}
        <div className="flex items-center justify-between mb-4">
          {/* Agent A */}
          <div className="flex-1 text-center">
            <div
              className={`agent-avatar mx-auto mb-2 ${
                winner === fight.agentA
                  ? 'border-yellow-500 animate-winner-glow'
                  : 'border-purple-500/30'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
              }}
            >
              <span className="relative z-10">🤖</span>
            </div>
            <p
              className={`font-bold text-sm truncate px-1 ${
                winner === fight.agentA ? 'text-yellow-400 glow-gold' : 'text-white'
              }`}
            >
              {winner === fight.agentA && (
                <span className="animate-crown-float inline-block mr-1">👑</span>
              )}
              {agentAName}
            </p>
          </div>

          {/* VS Badge */}
          <div className="px-3 flex flex-col items-center">
            <div className="vs-badge">VS</div>
            <span className="text-[10px] text-gray-600 mt-1 font-mono">#{fight.id}</span>
          </div>

          {/* Agent B */}
          <div className="flex-1 text-center">
            <div
              className={`agent-avatar mx-auto mb-2 ${
                winner === fight.agentB
                  ? 'border-yellow-500 animate-winner-glow'
                  : 'border-cyan-500/30'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(236,72,153,0.2))',
              }}
            >
              <span className="relative z-10">🤖</span>
            </div>
            <p
              className={`font-bold text-sm truncate px-1 ${
                winner === fight.agentB ? 'text-yellow-400 glow-gold' : 'text-white'
              }`}
            >
              {winner === fight.agentB && (
                <span className="animate-crown-float inline-block mr-1">👑</span>
              )}
              {agentBName}
            </p>
          </div>
        </div>

        {/* ── Info Row ── */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-black/20 rounded-xl border border-gray-800/50">
          <span className="mon-amount text-yellow-400 text-sm">
            💰 {fight.stakeAmount || '0'} <span className="mon-symbol">MON</span>
          </span>
          <div
            className={`status-badge ${
              isCompleted ? 'completed' : isFighting ? 'fighting' : 'open'
            }`}
          >
            <span className="status-dot" />
            {isCompleted ? 'DONE' : isFighting ? 'LIVE' : 'OPEN'}
          </div>
        </div>

        {/* ── Winner Banner ── */}
        {winner && (
          <div className="mt-3 text-center py-2.5 bg-yellow-900/15 border border-yellow-800/30 rounded-xl animate-fade-in-up">
            <span className="text-yellow-400 text-sm font-bold">
              🏆 {getName(winner)} wins!
            </span>
          </div>
        )}

        {/* ── Resolve Button ── */}
        {!isCompleted && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="btn-battle btn-shine mt-3 w-full py-2.5 bg-gradient-to-r from-red-600/80 to-orange-600/80 hover:from-red-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 border border-red-500/20 rounded-xl text-white font-bold text-sm"
          >
            {resolving ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="loading-spinner"
                  style={{ width: 16, height: 16, borderWidth: 2 }}
                />
                Resolving...
              </span>
            ) : (
              '⚡ Resolve Fight'
            )}
          </button>
        )}

        {/* ── Click Hint ── */}
        {battleLog.length > 0 && !winner && (
          <p className="text-center text-gray-600 text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view battle log
          </p>
        )}
      </div>

      {/* ══════════════════════════════════════════
          BATTLE LOG MODAL
         ══════════════════════════════════════════ */}
      {logOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setLogOpen(false)}
        >
          <div
            className="modal-content max-w-lg max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <div>
                <h3 className="font-px-heading text-sm text-white">📜 Battle Log</h3>
                <p className="text-gray-500 text-xs mt-1 font-mono">
                  {agentAName} vs {agentBName}
                </p>
              </div>
              <button
                onClick={() => setLogOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              >
                ✕
              </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] space-y-4">
              {/* Reasoning */}
              {reasoning && (
                <div className="glass-card p-3 animate-fade-in-up">
                  <p className="text-purple-300 text-sm italic">
                    <span className="text-purple-500 font-bold">💭 AI Analysis:</span>{' '}
                    {reasoning}
                  </p>
                </div>
              )}

              {/* Battle Log */}
              <BattleLog
                lines={battleLog}
                autoPlay={!!result}
                speed={180}
                onLineReveal={handleLineReveal}
                onComplete={() => {
                  if (winner) {
                    setTimeout(() => fireConfetti(), 300)
                  }
                }}
              />

              {/* Winner Card */}
              {winner && (
                <div className="text-center py-5 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-800/30 rounded-xl animate-fade-in-up">
                  <p className="text-4xl mb-2 animate-trophy-bounce">🏆</p>
                  <p className="text-yellow-400 font-bold text-lg glow-gold">
                    {getName(winner)} Wins!
                  </p>
                  <p className="text-yellow-600/70 text-xs mt-1 font-mono">
                    Prize: {fight.stakeAmount || '?'} MON
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}