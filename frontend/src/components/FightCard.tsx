import { useState, useEffect } from 'react'
import { resolveFight, getAgents } from '../api/client'
import BattleLog from './BattleLog'
import toast from 'react-hot-toast'

export default function FightCard({ fight, onResolved }: { fight: any, onResolved?: () => void }) {
  const [logOpen, setLogOpen] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [agentMap, setAgentMap] = useState<Record<number, string>>({})

  useEffect(() => {
    getAgents().then((agents: any[]) => {
      const map: Record<number, string> = {}
      ;(agents || []).forEach((a: any) => { map[a.id] = a.name })
      setAgentMap(map)
    }).catch(() => {})
  }, [])

  const getName = (id: number) => agentMap[id] || `Agent #${id}`

  const handleResolve = async (e: any) => {
    e.stopPropagation()
    setResolving(true)
    try {
      const res = await resolveFight(fight.id)
      setResult(res)
      setLogOpen(true)
      toast.success('Fight resolved! ⚔️')
      onResolved?.()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resolve')
    } finally {
      setResolving(false)
    }
  }

  const isCompleted = fight.status === 'completed'
  const isFighting = fight.status === 'in_progress'
  const battleLog = result?.battleLog || fight.battleLog || []
  const winner = result?.winner || fight.winner
  const reasoning = result?.reasoning || fight.reasoning

  return (
    <>
      <div
        className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 border rounded-2xl p-5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
          isCompleted
            ? 'border-green-500/20 hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]'
            : isFighting
            ? 'border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            : 'border-yellow-500/20 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]'
        }`}
        onClick={() => battleLog.length > 0 && setLogOpen(true)}
      >
        {/* VS Section */}
        <div className="flex items-center justify-between mb-4">
          {/* Agent A */}
          <div className="flex-1 text-center">
            <div className={`text-3xl mb-1.5 transition-transform duration-300 ${winner === fight.agentA ? 'scale-110' : 'group-hover:scale-105'}`}>
              🤖
            </div>
            <p className={`font-bold text-sm truncate px-1 ${
              winner === fight.agentA ? 'text-yellow-400' : 'text-white'
            }`}>
              {winner === fight.agentA && '👑 '}{getName(fight.agentA)}
            </p>
          </div>

          {/* VS Badge */}
          <div className="px-3 flex flex-col items-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              isFighting
                ? 'bg-gradient-to-r from-red-600 to-orange-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : isCompleted
                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}>
              ⚔️
            </div>
            <span className="text-[10px] text-gray-600 mt-1 font-mono">#{fight.id}</span>
          </div>

          {/* Agent B */}
          <div className="flex-1 text-center">
            <div className={`text-3xl mb-1.5 transition-transform duration-300 ${winner === fight.agentB ? 'scale-110' : 'group-hover:scale-105'}`}>
              🤖
            </div>
            <p className={`font-bold text-sm truncate px-1 ${
              winner === fight.agentB ? 'text-yellow-400' : 'text-white'
            }`}>
              {winner === fight.agentB && '👑 '}{getName(fight.agentB)}
            </p>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-black/20 rounded-xl border border-gray-800/50">
          <span className="text-yellow-400 font-mono font-bold text-sm">💰 {fight.stakeAmount || '0'} MON</span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
            isCompleted
              ? 'bg-green-900/40 text-green-400 border border-green-800/40'
              : isFighting
              ? 'bg-red-900/40 text-red-400 border border-red-800/40 animate-pulse'
              : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/40'
          }`}>
            {isCompleted ? '✅ DONE' : isFighting ? '⚡ LIVE' : '🟡 OPEN'}
          </span>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="mt-3 text-center py-2 bg-yellow-900/15 border border-yellow-800/30 rounded-xl">
            <span className="text-yellow-400 text-sm font-bold">🏆 {getName(winner)} wins!</span>
          </div>
        )}

        {/* Resolve Button */}
        {!isCompleted && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="mt-3 w-full py-2.5 bg-gradient-to-r from-red-600/80 to-orange-600/80 hover:from-red-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 border border-red-500/20 rounded-xl text-white font-bold text-sm transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:scale-[1.02] active:scale-95"
          >
            {resolving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resolving...
              </span>
            ) : '⚡ Resolve Fight'}
          </button>
        )}

        {/* Click hint */}
        {battleLog.length > 0 && (
          <p className="text-center text-gray-600 text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view battle log
          </p>
        )}
      </div>

      {/* ═══ Battle Log Modal ═══ */}
      {logOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setLogOpen(false)}>
          <div
            className="bg-gradient-to-br from-[#12132e] to-[#0b0c1a] border border-gray-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[modalSlideUp_0.3s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-white">📜 Battle Log</h3>
                <p className="text-gray-600 text-xs mt-0.5">
                  {getName(fight.agentA)} vs {getName(fight.agentB)}
                </p>
              </div>
              <button onClick={() => setLogOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all">✕</button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-140px)]">
              {/* Reasoning */}
              {reasoning && (
                <div className="bg-purple-900/15 border border-purple-800/30 rounded-xl p-3 mb-4">
                  <p className="text-purple-300 text-sm italic">💭 {reasoning}</p>
                </div>
              )}

              {/* Battle Log */}
              <BattleLog lines={battleLog} autoPlay={true} />

              {/* Winner */}
              {winner && (
                <div className="mt-4 text-center py-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-800/30 rounded-xl">
                  <p className="text-3xl mb-1">🏆</p>
                  <p className="text-yellow-400 font-bold text-lg">{getName(winner)} Wins!</p>
                  <p className="text-yellow-600 text-xs mt-1">Claimed {fight.stakeAmount || '?'} MON</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}