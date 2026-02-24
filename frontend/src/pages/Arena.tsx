import { useState, useEffect } from 'react'
import { getFights, getAgents, createFight, resolveFight } from '../api/client'
import toast from 'react-hot-toast'

export default function Arena() {
  const [fights, setFights] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [agentA, setAgentA] = useState('')
  const [agentB, setAgentB] = useState('')
  const [stake, setStake] = useState('10')
  const [creating, setCreating] = useState(false)
  const [resolving, setResolving] = useState<number | null>(null)
  const [battleModal, setBattleModal] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [f, a] = await Promise.all([getFights(), getAgents()])
      setFights(f)
      setAgents(a)
    } catch (e: any) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const getAgentName = (id: number) => {
    const agent = agents.find((a: any) => a.id === id)
    return agent?.name ?? `Agent #${id}`
  }

  const handleCreate = async () => {
    if (!agentA || !agentB) return toast.error('Select both agents')
    if (agentA === agentB) return toast.error('Pick two different agents')
    if (!stake || parseFloat(stake) <= 0) return toast.error('Enter a valid stake')
    setCreating(true)
    try {
      await createFight({ agentA: Number(agentA), agentB: Number(agentB), stakeAmount: stake })
      toast.success('Fight created!')
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

  const handleResolve = async (id: number) => {
    setResolving(id)
    try {
      const result = await resolveFight(id)
      toast.success('Fight resolved!')
      setBattleModal(result)
      fetchData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to resolve')
    } finally {
      setResolving(null)
    }
  }

  const filtered = fights.filter((f: any) => {
    if (filter === 'all') return true
    return f.status === filter
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          ⚔️ The Arena
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
        >
          + Create Challenge
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'in_progress', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'in_progress' ? 'Fighting' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-400 text-center py-12">Loading fights...</p>}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">🏟️</p>
          <p>No fights yet. Create a challenge!</p>
        </div>
      )}

      {/* Fight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((fight: any) => (
          <div
            key={fight.id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 hover:border-purple-500 transition-all cursor-pointer"
            onClick={() => fight.battleLog?.length > 0 && setBattleModal(fight)}
          >
            {/* Agents */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <p className="text-lg font-bold text-white">
                  {fight.winner === fight.agentA && '👑 '}
                  {getAgentName(fight.agentA)}
                </p>
              </div>
              <div className="px-4">
                <span className="text-yellow-400 font-bold text-lg">⚔️ VS</span>
              </div>
              <div className="text-center flex-1">
                <p className="text-lg font-bold text-white">
                  {fight.winner === fight.agentB && '👑 '}
                  {getAgentName(fight.agentB)}
                </p>
              </div>
            </div>

            {/* Info Row */}
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-mono">{fight.stakeAmount} MON</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                fight.status === 'completed' ? 'bg-green-900 text-green-300' :
                fight.status === 'in_progress' ? 'bg-red-900 text-red-300 animate-pulse' :
                'bg-yellow-900 text-yellow-300'
              }`}>
                {fight.status === 'completed' ? '✅ Done' :
                 fight.status === 'in_progress' ? '🔴 Fighting' :
                 '🟡 Open'}
              </span>
            </div>

            {/* Resolve Button */}
            {fight.status !== 'completed' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleResolve(fight.id) }}
                disabled={resolving === fight.id}
                className="mt-4 w-full py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white rounded-lg font-bold transition-all"
              >
                {resolving === fight.id ? '⏳ Resolving...' : '⚡ Resolve Fight'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ========== CREATE FIGHT MODAL ========== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">⚔️ Create Challenge</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            {/* Agent A */}
            <label className="block text-gray-400 text-sm mb-2">Agent A (Your Fighter)</label>
            <select
              value={agentA}
              onChange={(e) => setAgentA(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white mb-4 focus:border-purple-500 outline-none"
            >
              <option value="">-- Select Agent A --</option>
              {agents.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} (ID: {a.id})</option>
              ))}
            </select>

            {/* Agent B */}
            <label className="block text-gray-400 text-sm mb-2">Agent B (Opponent)</label>
            <select
              value={agentB}
              onChange={(e) => setAgentB(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white mb-4 focus:border-purple-500 outline-none"
            >
              <option value="">-- Select Agent B --</option>
              {agents.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} (ID: {a.id})</option>
              ))}
            </select>

            {/* Stake Amount */}
            <label className="block text-gray-400 text-sm mb-2">Stake Amount (MON)</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="10"
              min="0.1"
              step="0.1"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white mb-6 focus:border-purple-500 outline-none"
            />

            {/* Preview */}
            {agentA && agentB && (
              <div className="bg-gray-800 rounded-lg p-3 mb-4 text-center">
                <span className="text-purple-400 font-bold">{getAgentName(Number(agentA))}</span>
                <span className="text-yellow-400 mx-2">⚔️</span>
                <span className="text-cyan-400 font-bold">{getAgentName(Number(agentB))}</span>
                <p className="text-yellow-400 text-sm mt-1">Wager: {stake} MON each</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={creating || !agentA || !agentB}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-bold text-lg transition-all"
            >
              {creating ? '⏳ Creating...' : '⚔️ Start Fight'}
            </button>
          </div>
        </div>
      )}

      {/* ========== BATTLE LOG MODAL ========== */}
      {battleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">📜 Battle Log</h2>
              <button onClick={() => setBattleModal(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            {battleModal.reasoning && (
              <p className="text-yellow-300 mb-4 italic">{battleModal.reasoning}</p>
            )}

            <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-sm">
              {(battleModal.battleLog ?? []).map((line: string, i: number) => (
                <p key={i} className="text-green-400 mb-1">{line}</p>
              ))}
              {(!battleModal.battleLog || battleModal.battleLog.length === 0) && (
                <p className="text-gray-500">No battle log available.</p>
              )}
            </div>

            {battleModal.winner && (
              <div className="mt-4 text-center">
                <p className="text-2xl">🏆</p>
                <p className="text-yellow-400 font-bold">Winner: {getAgentName(battleModal.winner)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}