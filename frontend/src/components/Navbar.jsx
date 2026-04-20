import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

const navLinks = [
  { to: '/map', label: '🗺️ Map' },
  { to: '/leaderboard', label: '🏆 Leaderboard' },
  { to: '/report', label: '📍 Report' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🛣️</span>
          <span className="font-extrabold text-lg">Solapur<span className="text-brand">Roads</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? 'bg-brand text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={`/profile/${user.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" />
                <span className="text-sm font-medium hidden md:block">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="btn-primary text-sm py-2">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
