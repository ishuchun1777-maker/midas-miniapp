import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiShoppingBag, FiCheckCircle, FiDollarSign, FiBarChart2, FiShield } from 'react-icons/fi'

// Stats card component
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-dark-900/50 backdrop-blur-xl border border-dark-800 p-6 rounded-2xl"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-dark-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-display text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
)

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('auth_token') // basic token storage
        
        // Fetch stats
        const statsRes = await fetch('/api/v1/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        // Fetch users
        const usersRes = await fetch('/api/v1/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        }
      } catch (err) {
        console.error('Admin fetch failed:', err)
        // Fallback to mock for UI demonstration if needed
      } finally {
        setLoading(false)
      }
    }
    fetchAdminData()
  }, [])

  const handleVerify = async (userId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/v1/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_verified: true } : u))
      }
    } catch (err) {
      console.error('Verification failed:', err)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display text-white">Admin Dashboard</h1>
          <p className="text-dark-400 mt-1">Platforma holati va foydalanuvchilarni boshqarish</p>
        </div>
        <div className="px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-500 text-sm font-medium flex items-center gap-2">
          <FiShield /> Admin Mode
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Jami foydalanuvchilar" value={stats?.users || 0} icon={FiUsers} color="blue" />
        <StatCard title="Faol e'lonlar" value={stats?.listings || 0} icon={FiShoppingBag} color="purple" />
        <StatCard title="Bitimlar" value={stats?.deals || 0} icon={FiCheckCircle} color="green" />
        <StatCard title="Jami aylanma" value={`${(stats?.total_revenue || 0).toLocaleString()} UZS`} icon={FiDollarSign} color="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display text-white">Yangi foydalanuvchilar</h2>
            <button className="text-gold-500 text-sm hover:underline">Hammasini ko'rish</button>
          </div>
          
          <div className="bg-dark-900/50 backdrop-blur-xl border border-dark-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dark-800 bg-dark-800/20">
                  <th className="px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Foydalanuvchi</th>
                  <th className="px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Telegram</th>
                  <th className="px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Sana</th>
                  <th className="px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-white font-medium">
                          {user.first_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-dark-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-300">
                      @{user.telegram_username}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-400">
                      {user.created_at}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!user.is_verified ? (
                        <button 
                          onClick={() => handleVerify(user.id)}
                          className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-500 hover:text-white transition-all"
                        >
                          Tasdiqlash
                        </button>
                      ) : (
                        <span className="text-green-500 flex items-center justify-end gap-1 text-xs">
                          <FiCheckCircle size={14} /> Tasdiqlangan
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-display text-white">Tezkor amallar</h2>
          <div className="bg-dark-900/50 backdrop-blur-xl border border-dark-800 rounded-2xl p-6 space-y-4">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors text-white text-sm">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500"><FiBarChart2 size={18} /></div>
              Hisobotni yuklash (.csv)
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors text-white text-sm">
              <div className="p-2 rounded-lg bg-gold-500/20 text-gold-500"><FiShield size={18} /></div>
              Moderatsiya qoidalari
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors text-white text-sm">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500"><FiUsers size={18} /></div>
              Sistem bildirishnomasi
            </button>
          </div>

          <h2 className="text-xl font-display text-white mt-8">Oxirgi harakatlar</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-4 bg-dark-900/30 border border-dark-800/50 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-white">Yangi to'lov qabul qilindi</p>
                  <p className="text-xs text-dark-500 mt-1">2 daqiqa oldin • Click</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
