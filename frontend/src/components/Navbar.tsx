import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import WalletButton from './WalletButton'

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/arena', label: 'Arena', icon: '⚔️' },
    { to: '/markets', label: 'Markets', icon: '🔮' },
    { to: '/agents', label: 'Agents', icon: '🤖' },
    { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="w-full border-b border-gray-800/80 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-bounce" style={{ animationDuration: '2s' }}>⚔️</span>
            <span
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.85rem' }}
            >
              AI Coliseum
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'text-white bg-purple-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <WalletButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileOpen ? (
                <span className="text-xl">✕</span>
              ) : (
                <span className="text-xl">☰</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800 mt-2 pt-3">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'text-white bg-purple-600/20 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}