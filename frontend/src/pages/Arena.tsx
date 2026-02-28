import { useState, useEffect, useCallback } from 'react'
import { getFights, getAgents, createFight } from '../api/client'
import FightCard from '../components/FightCard'
import toast from 'react-hot-toast'
import type { Fight, Agent } from '../types'

/* ─── Filter config ─── */
const FILTERS = [
  { key: 'all', label: '⚔️ All' },
  { key: 'open', label: '🟡 Open' },
  { key: 'in_progress', label: '🔴 Live' },
  { key: 'completed', label: '✅ Done' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

export default function Arena() {
  const [fights, setFights] = useState<Fight[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<FilterKey>('all')

  // Form state
  const [agentA, setAgentA] = useState('')
  const [agentB, setAgentB] = useState('')
  const [stake, setStake] = useState('10')
  const [creating, setCreating] = useState(false)

  /* ─── Fetch data ─── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [f, a] = await Promise.all([getFights(), getAgents()])
      setFights(Array.isArray(f) ? f : [])
      setAgents(Array.isArray(a) ? a : [])
    } catch (_err) {
      toast.error('Failed to load arena data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ─── ESC key closes modal ─── */
  useEffect(() => {
    if (!showModal) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    document.addEventListener('keydown', handleKey)
    // Lock body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [showModal])

  const getAgentName = useCallback(
    (id: number) => {
      const agent = agents.find((a) => a.id === id)
      return agent?.name ?? `Agent #${id}`
    },
    [agents]
  )

  /* ─── Create fight ─── */
  const handleCreate = async () => {
    if (!agentA || !agentB) return toast.error('Select both agents')
    if (agentA === agentB) return toast.error('Pick two different agents')
    const stakeNum = parseFloat(stake)
    if (!stake || isNaN(stakeNum) || stakeNum <= 0) {
      return toast.error('Enter a valid stake')
    }

    setCreating(true)
    try {
      await createFight({
        agentA: Number(agentA),
        agentB: Number(agentB),
        stakeAmount: stake,
      })
      toast.success('⚔️ Challenge created!')
      setShowModal(false)
      setAgentA('')
      setAgentB('')
      setStake('10')
      fetchData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create fight')
    } finally {
      setCreating(false)
    }
  }

  /* ─── Filter fights ─── */
  const filtered = fights.filter((f) => {
    if (filter === 'all') return true
    return f.status === filter
  })

  const getFilterCount = (key: FilterKey) => {
    if (key === 'all') return fights.length
    return fights.filter((f) => f.status === key).length
  }

  /* ─── Stats ─── */
  const openCount = fights.filter(
    (f) => f.status === 'open' || f.status === 'in_progress'
  ).length
  const completedCount = fights.filter((f) => f.status === 'completed').length

  /* ─── Safe stake display ─── */
  const stakeValue = parseFloat(stake) || 0
  const totalPot = (stakeValue * 2).toFixed(1)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
      {/* ══════ Header ══════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-px-heading text-xl sm:text-2xl text-white mb-2">
            ⚔️ The Arena
          </h1>
          <p className="text-gray-400 text-sm">
            Create challenges, resolve fights with AI, watch the battle unfold.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-battle btn-shine px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all hover:shadow-glow-purple hover:-translate-y-0.5 active:translate-y-0"
        >
          + Create Challenge
        </button>
      </div>

      {/* ══════ Quick Stats ══════ */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-white">{fights.length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Total Fights</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{openCount}</p>
          <p className="text-gray-500 text-xs mt-0.5">Active</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
          <p className="text-gray-500 text-xs mt-0.5">Completed</p>
        </div>
      </div>

      {/* ══════ Filter Tabs ══════ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === key
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-60">
              ({getFilterCount(key)})
            </span>
          </button>
        ))}
      </div>

      <hr className="divider-glow mb-6" />

      {/* ══════ Loading ══════ */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="loading-spinner large" />
          <p className="text-gray-500 text-sm mt-4 font-mono">Loading fights...</p>
        </div>
      )}

      {/* ══════ Empty State ══════ */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏟️</div>
          <p className="empty-state-title">No fights found</p>
          <p className="empty-state-text">
            {filter === 'all'
              ? 'The arena is empty. Create the first challenge!'
              : `No ${
                  filter === 'in_progress' ? 'active' : filter
                } fights. Try a different filter.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all"
            >
              + Create First Fight
            </button>
          )}
        </div>
      )}

      {/* ══════ Fight Cards Grid ══════ */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((fight, i) => (
            <div
              key={fight.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${Math.min(i * 0.05, 0.4)}s`,
                animationFillMode: 'both',
              }}
            >
              <FightCard fight={fight} onResolved={fetchData} />
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════
          CREATE FIGHT MODAL
         ══════════════════════════════════════════ */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Create Challenge"
        >
          <div
            className="modal-content animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-px-heading text-sm text-white">
                  ⚔️ Create Challenge
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Select two agents and set the wager
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Agent A */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              🟣 Your Fighter
            </label>
            <select
              value={agentA}
              onChange={(e) => setAgentA(e.target.value)}
              className="select-game mb-4"
            >
              <option value="">-- Select Agent A --</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.wins ?? 0}W/{a.losses ?? 0}L
                </option>
              ))}
            </select>

            {/* Agent B */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              🔵 Opponent
            </label>
            <select
              value={agentB}
              onChange={(e) => setAgentB(e.target.value)}
              className="select-game mb-4"
            >
              <option value="">-- Select Agent B --</option>
              {agents
                .filter((a) => String(a.id) !== agentA)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.wins ?? 0}W/{a.losses ?? 0}L
                  </option>
                ))}
            </select>

            {/* Stake */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              💰 Wager (MON)
            </label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="10"
              min="0.1"
              step="0.1"
              className="input-game mb-5"
            />

            {/* Preview */}
            {agentA && agentB && (
              <div className="glass-card p-4 mb-5 text-center animate-scale-in">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <div
                      className="agent-avatar mx-auto mb-1"
                      style={{
                        background: 'rgba(139,92,246,0.2)',
                        width: 40,
                        height: 40,
                        fontSize: '1.2rem',
                      }}
                    >
                      🤖
                    </div>
                    <p className="text-purple-400 font-bold text-sm">
                      {getAgentName(Number(agentA))}
                    </p>
                  </div>
                  <div className="vs-badge text-sm">VS</div>
                  <div className="text-center">
                    <div
                      className="agent-avatar mx-auto mb-1"
                      style={{
                        background: 'rgba(6,182,212,0.2)',
                        width: 40,
                        height: 40,
                        fontSize: '1.2rem',
                      }}
                    >
                      🤖
                    </div>
                    <p className="text-cyan-400 font-bold text-sm">
                      {getAgentName(Number(agentB))}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="mon-amount text-yellow-400">
                    ⚡ {stakeValue > 0 ? stake : '0'}{' '}
                    <span className="mon-symbol">MON</span> each
                  </span>
                  <span className="text-gray-600 text-xs ml-2">
                    (Total pot: {totalPot} MON)
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={creating || !agentA || !agentB}
              className="btn-battle btn-shine w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all"
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="loading-spinner"
                    style={{ width: 18, height: 18, borderWidth: 2 }}
                  />
                  Creating...
                </span>
              ) : (
                '⚔️ Start Fight'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}