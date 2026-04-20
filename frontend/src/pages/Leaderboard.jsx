import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const BADGES = {
  diamond: { icon: '💎', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  gold: { icon: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  silver: { icon: '🥈', color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/20' },
  bronze: { icon: '🥉', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
}

const DEMO_DATA = [
  { rank: 1, id: 'u1', name: 'Rahul Patil', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Rahul', points: 830, reports_count: 83, badge: 'diamond' },
  { rank: 2, id: 'u2', name: 'Priya Deshmukh', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya', points: 650, reports_count: 65, badge: 'diamond' },
  { rank: 3, id: 'u3', name: 'Amit Kulkarni', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Amit', points: 440, reports_count: 44, badge: 'gold' },
  { rank: 4, id: 'u4', name: 'Sneha More', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Sneha', points: 310, reports_count: 31, badge: 'gold' },
  { rank: 5, id: 'u5', name: 'Vikas Jadhav', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikas', points: 180, reports_count: 18, badge: 'silver' },
  { rank: 6, id: 'u6', name: 'Kiran Shinde', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Kiran', points: 130, reports_count: 13, badge: 'silver' },
  { rank: 7, id: 'u7', name: 'Meera Gaikwad', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Meera', points: 90, reports_count: 9, badge: 'bronze' },
  { rank: 8, id: 'u8', name: 'Suresh Naik', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Suresh', points: 60, reports_count: 6, badge: 'bronze' },
]

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [period, setPeriod] = useState('all_time')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    api.get(`/leaderboard?period=${period}`)
      .then(res => setData(res.data))
      .catch(() => setData(DEMO_DATA))
      .finally(() => setLoading(false))
  }, [period])

  const top3 = data.slice(0, 3)
  const rest = data.slice(3)
  const myRank = user ? data.find(d => d.id === user.id) : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Leaderboard 🏆</h1>
          <p className="text-white/40 mt-1">Top road reporters in Solapur</p>
        </div>
        <div className="flex gap-1 bg-dark-700 rounded-xl p-1 border border-white/10">
          {[['weekly', 'Week'], ['monthly', 'Month'], ['all_time', 'All Time']].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === val ? 'bg-brand text-white' : 'text-white/40 hover:text-white'}`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Podium top 3 */}
      {!loading && top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, i) => {
            const heights = [120, 152, 100]
            const ranks = [2, 1, 3]
            const rankIndex = i
            return (
              <motion.div key={user.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{BADGES[user.badge]?.icon}</span>
                <img src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full border-2 border-brand/40" />
                <span className="text-sm font-semibold text-center max-w-[80px] truncate">{user.name}</span>
                <span className="text-brand font-bold text-sm">{user.points} pts</span>
                <div className={`w-20 rounded-t-lg flex items-center justify-center font-black text-2xl ${ranks[rankIndex] === 1 ? 'bg-brand' : 'bg-dark-600 border border-white/10'}`} style={{ height: heights[rankIndex] }}>
                  #{ranks[rankIndex]}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* My rank highlight */}
      {myRank && (
        <div className="card border-brand/30 bg-brand/5 mb-4 flex items-center justify-between">
          <span className="text-sm text-brand font-semibold">Your rank: #{myRank.rank}</span>
          <span className="text-sm font-bold">{myRank.points} pts</span>
        </div>
      )}

      {/* Full list */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-white/30">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mr-3"/>Loading...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/30 font-semibold px-5 py-3">#</th>
                <th className="text-left text-xs text-white/30 font-semibold px-5 py-3">User</th>
                <th className="text-right text-xs text-white/30 font-semibold px-5 py-3">Reports</th>
                <th className="text-right text-xs text-white/30 font-semibold px-5 py-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => {
                const badge = BADGES[entry.badge]
                const isMe = user?.id === entry.id
                return (
                  <motion.tr key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isMe ? 'bg-brand/5' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold ${i < 3 ? 'text-brand' : 'text-white/40'}`}>#{entry.rank}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/profile/${entry.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src={entry.avatar_url} alt={entry.name} className="w-8 h-8 rounded-full border border-white/20" />
                        <div>
                          <div className="text-sm font-semibold flex items-center gap-1.5">
                            {entry.name}
                            {isMe && <span className="text-xs text-brand">(you)</span>}
                          </div>
                        </div>
                        <span className={`ml-1 border rounded-full px-2 py-0.5 text-xs font-bold ${badge?.bg} ${badge?.color}`}>{badge?.icon} {entry.badge}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-white/50">{entry.reports_count}</td>
                    <td className="px-5 py-4 text-right font-bold text-brand">{entry.points}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
