import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'

const CONDITION_COLORS = { dangerous: '#ef4444', poor: '#f97316', medium: '#eab308', good: '#22c55e' }

export default function Profile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(res => setProfile(res.data))
      .catch(() => setProfile({
        id, name: 'Sample User', avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=User`,
        total_points: 120, reports_count: 12, created_at: new Date().toISOString(),
        reports: []
      }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/></div>
  if (!profile) return <div className="text-center py-20 text-white/40">User not found</div>

  const badge = profile.total_points >= 500 ? '💎 Diamond' : profile.total_points >= 200 ? '🥇 Gold' : profile.total_points >= 100 ? '🥈 Silver' : '🥉 Bronze'
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-full border-2 border-brand/30" />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold">{profile.name}</h1>
          <p className="text-white/30 text-sm mt-1">Member since {joinDate}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3 justify-center sm:justify-start">
            <span className="bg-brand/10 border border-brand/20 text-brand text-sm font-bold px-3 py-1 rounded-full">{badge}</span>
            <span className="text-white/40 text-sm">{profile.reports_count} reports</span>
            <span className="text-white/40 text-sm">{profile.total_points} points</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[['🗺️', profile.reports_count, 'Reports'], ['⭐', profile.total_points, 'Points']].map(([icon, val, label]) => (
            <div key={label} className="bg-dark-600 border border-white/10 rounded-xl p-3 text-center min-w-[80px]">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xl font-extrabold text-brand">{val}</div>
              <div className="text-xs text-white/30">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Reports grid */}
      <h2 className="text-lg font-bold mb-4">Recent Reports</h2>
      {profile.reports?.length === 0 ? (
        <div className="card text-center py-12 text-white/30">
          <span className="text-4xl mb-3 block">📍</span>
          No reports yet. <Link to="/report" className="text-brand hover:underline">File the first one!</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {profile.reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card hover:border-white/20 transition-colors">
              {r.media_url && (
                r.media_type === 'video'
                  ? <video src={r.media_url} className="w-full h-36 object-cover rounded-lg mb-3" muted />
                  : <img src={r.media_url} alt="road" className="w-full h-36 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{r.area_name}</span>
                <span className={`badge-${r.condition}`}>{r.condition}</span>
              </div>
              <p className="text-xs text-white/30 mt-1">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
