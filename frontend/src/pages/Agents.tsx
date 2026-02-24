import { useState, useEffect } from 'react'
import { getAgents, createAgent } from '../api/client'
import toast from 'react-hot-toast'

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const data = await getAgents()
      setAgents(Array.isArray(data) ? data : [])
    } catch (e: any) {
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAgents() }, [])

  // Auto-fill wallet address if MetaMask is connected
  useEffect(() => {
    const getWallet = async () => {
      try {
        if ((window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts?.[0]) setOwner(accounts[0])
        }
      } catch {}
    }
    getWallet()
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Enter a name')
    if (!owner.trim()) return toast.error('Enter an owner address')
    setCreating(true)
    try {
      await createAgent({ name: name.trim(), owner: owner.trim() })
      toast.success('Agent created! 🤖')
      setShowModal(false)
      setName('')
      fetchAgents()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create agent')
    } finally {
      setCreating(false)
    }
  }

  const truncate = (addr: string) => {
    if (!addr || addr.length < 10) return addr
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  const getWinRate = (a: any) => {
    const total = (a.wins || 0) + (a.losses || 0)
    if (total === 0) return 0
    return Math.round(((a.wins || 0) / total) * 100)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          🤖 Agent Registry
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
        >
          + Register New Agent
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-400 text-center py-12">Loading agents...</p>}

      {/* Empty State */}
      {!loading && agents.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">🤖</p>
          <p className="mb-2">No agents registered yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Register your first agent!
          </button>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent: any) => (
          <div
            key={agent.id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl p-5 hover:border-purple-500 hover:-translate-y-1 transition-all"
          >
            {/* Avatar + Name */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{agent.avatar || '🤖'}</div>
              <h3 className="text-lg font-bold text-white">{agent.name}</h3>
              <p className="text-gray-500 text-sm font-mono">{truncate(agent.owner)}</p>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm mb-3">
              <span className="text-green-400">W: {agent.wins || 0}</span>
              <span className="text-red-400">L: {agent.losses || 0}</span>
              <span className="text-yellow-400">{getWinRate(agent)}% WR</span>
            </div>

            {/* Win Rate Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${getWinRate(agent)}%` }}
              />
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-300">
                ● Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ========== REGISTER AGENT MODAL ========== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">🤖 Register New Agent</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            {/* Agent Name */}
            <label className="block text-gray-400 text-sm mb-2">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AlphaBot, ShadowBlade..."
              maxLength={30}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white mb-4 focus:border-purple-500 outline-none"
            />

            {/* Owner Address */}
            <label className="block text-gray-400 text-sm mb-2">Owner Wallet Address</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="0x..."
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white mb-2 focus:border-purple-500 outline-none font-mono text-sm"
            />
            <p className="text-gray-600 text-xs mb-6">
              {owner ? `Connected: ${truncate(owner)}` : 'Connect MetaMask to auto-fill'}
            </p>

            {/* Preview */}
            {name && (
              <div className="bg-gray-800 rounded-lg p-3 mb-4 text-center">
                <span className="text-3xl">🤖</span>
                <p className="text-purple-400 font-bold mt-1">{name}</p>
                <p className="text-gray-500 text-xs font-mono">{truncate(owner) || 'No owner set'}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-bold text-lg transition-all"
            >
              {creating ? '⏳ Deploying...' : '🚀 Deploy Agent'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}