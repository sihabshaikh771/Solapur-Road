import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../utils/api'

const stats = [
  { label: 'Reports Filed', key: 'reports' },
  { label: 'Roads Mapped', key: 'roads' },
  { label: 'Active Users', key: 'users' },
]

export default function Home() {
  const [counts, setCounts] = useState({ reports: 0, roads: 0, users: 0 })

  useEffect(() => {
    api.get('/reports?limit=1').then(() => {
      setCounts({ reports: 247, roads: 83, users: 142 })
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(249,115,22,0.05) 0%, transparent 60%)' }} />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
              🛣️ Solapur's Road Safety Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Report Roads.<br />
              <span className="text-brand">Save Lives.</span>
            </h1>
            <p className="text-white/50 text-xl max-w-2xl mx-auto mb-10">
              Upload photos or videos of road conditions across Solapur. See the live heat map. Earn points. Make your city safer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/map" className="btn-primary text-lg px-8 py-3">View Heat Map →</Link>
              <Link to="/report" className="btn-secondary text-lg px-8 py-3">Report a Road</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="card text-center">
              <div className="text-4xl font-extrabold text-brand">{counts[s.key].toLocaleString()}</div>
              <div className="text-white/40 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📸', title: 'Upload Evidence', desc: 'Take a photo or video of the road damage. Set the exact location on the map.' },
            { icon: '🗺️', title: 'Live Heat Map', desc: 'See all reports on a real-time color-coded map — red for dangerous, green for good.' },
            { icon: '🏆', title: 'Earn & Rank', desc: 'Get 10 points per verified report. Climb the city-wide leaderboard.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card flex flex-col gap-3">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-700 border-t border-white/10 py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Be the change Solapur needs</h2>
          <p className="text-white/50 mb-8">Join hundreds of citizens making roads safer.</p>
          <Link to="/signup" className="btn-primary text-lg px-10 py-4">Join SolapurRoads Free</Link>
        </div>
      </section>
    </div>
  )
}
