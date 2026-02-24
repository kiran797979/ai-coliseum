import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Arena from './pages/Arena'
import Markets from './pages/Markets'
import Agents from './pages/Agents'
import Leaderboard from './pages/Leaderboard'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0b1e] text-gray-200 relative">

      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating orbs */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-cyan-500/[0.06] rounded-full blur-[100px] animate-float-medium" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-pink-500/[0.04] rounded-full blur-[80px] animate-float-fast" />
        <div className="absolute bottom-[10%] left-[25%] w-[350px] h-[350px] bg-yellow-500/[0.03] rounded-full blur-[90px] animate-float-medium" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Scanline effect */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="px-4 py-6 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/arena" element={<Arena />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* Custom Toast Styling */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1b3e',
            color: '#e5e7eb',
            border: '1px solid #2a2b5e',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.1)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#0a0b1e' },
            style: { borderColor: '#22c55e30' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a0b1e' },
            style: { borderColor: '#ef444430' },
          },
        }}
      />
    </div>
  )
}