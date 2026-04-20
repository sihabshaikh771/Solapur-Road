import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to SolapurRoads 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🛣️</span>
          <h1 className="text-3xl font-extrabold mt-4">Join SolapurRoads</h1>
          <p className="text-white/40 mt-2">Help make Solapur's roads safer</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Full Name</label>
              <input className="input" type="text" placeholder="Rahul Patil" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Password</label>
              <input className="input" type="password" placeholder="At least 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
            </div>

            <div className="bg-brand/10 border border-brand/20 rounded-xl p-3 text-sm text-brand/80">
              🎁 Earn <strong className="text-brand">10 points</strong> for every road you report. Climb the city leaderboard!
            </div>

            <button type="submit" disabled={loading} className="btn-primary py-3 mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
