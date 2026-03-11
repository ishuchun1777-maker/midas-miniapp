import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star, Handshake, BadgeCheck, Settings, ChevronRight,
  Plus, LogOut, User, Send, Globe, Phone
} from 'lucide-react'
import { usersApi, dealsApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

export default function MiniProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore()

  const { data: profiles } = useQuery({
    queryKey: ['my-profiles'],
    queryFn: () => usersApi.myProfiles().then((r) => r.data),
    enabled: isAuthenticated,
  })

  const { data: deals } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list().then((r) => r.data),
    enabled: isAuthenticated,
  })

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-4">
          <User className="w-7 h-7 text-dark-400" />
        </div>
        <h2 className="font-semibold text-white mb-2">Kirish kerak</h2>
        <p className="text-dark-400 text-sm mb-6">Profilingizni ko'rish uchun Telegram orqali kiring</p>
        <Link to="/login" className="btn-primary">Kirish</Link>
      </div>
    )
  }

  const primaryProfile = profiles?.[0]
  const completedDeals = deals?.filter((d) => d.status === 'completed').length || 0
  const activeDeals = deals?.filter((d) => ['in_progress', 'agreed'].includes(d.status)).length || 0

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-white">Profil</h1>
        <Link to="/settings" className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center">
          <Settings className="w-4 h-4 text-dark-400" />
        </Link>
      </div>

      <div className="px-4 pt-5">
        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-5"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 overflow-hidden">
              {user.photo_url
                ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <User className="w-7 h-7 text-dark-400" />
                  </div>
              }
            </div>
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-dark-950" />
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">
              {user.first_name} {user.last_name}
            </h2>
            {user.telegram_username && (
              <p className="text-dark-400 text-sm">@{user.telegram_username}</p>
            )}
            {primaryProfile?.city && (
              <p className="text-dark-500 text-xs mt-0.5">📍 {primaryProfile.city}</p>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { val: primaryProfile?.rating?.toFixed(1) || '—', label: 'Reyting', icon: Star, color: '#f59e0b' },
            { val: completedDeals, label: 'Bitim', icon: Handshake, color: '#34d399' },
            { val: activeDeals, label: 'Faol', icon: BadgeCheck, color: '#29b6f6' },
          ].map(({ val, label, icon: Icon, color }) => (
            <div key={label} className="bg-dark-900 border border-dark-800 rounded-xl p-3 text-center">
              <div className="w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div className="text-white font-bold text-base">{val}</div>
              <div className="text-[10px] text-dark-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {primaryProfile?.bio && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-dark-300 leading-relaxed">{primaryProfile.bio}</p>
          </div>
        )}

        {/* Profiles */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-dark-400 uppercase tracking-widest">Rollar</span>
            <Link to="/profile/create" className="text-gold-400 text-xs flex items-center gap-0.5">
              <Plus className="w-3 h-3" /> Qo'shish
            </Link>
          </div>
          <div className="space-y-2">
            {profiles?.map((p) => (
              <div key={p.id} className="bg-dark-900 border border-dark-800 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-gold-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white capitalize">{p.role.replace('_', ' ')}</div>
                  {p.specializations.length > 0 && (
                    <div className="text-[10px] text-dark-500 truncate">{p.specializations.join(', ')}</div>
                  )}
                </div>
                {p.verified_badge && <BadgeCheck className="w-4 h-4 text-gold-400" />}
              </div>
            ))}
            {!profiles?.length && (
              <Link
                to="/profile/create"
                className="flex items-center gap-3 p-3 bg-dark-900 border border-dashed border-dark-700 rounded-xl text-dark-400 hover:border-gold-500/40 hover:text-gold-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Profil yaratish</span>
              </Link>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-1.5 mb-6">
          {[
            { label: "E'lonlarim", to: '/my-listings' },
            { label: 'Kampaniyalarim', to: '/my-campaigns' },
            { label: 'Saqlangan', to: '/favorites' },
            { label: 'Bitimlar', to: '/deals' },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between px-4 py-3 bg-dark-900 border border-dark-800 rounded-xl active:scale-98 transition-all"
            >
              <span className="text-sm text-white">{label}</span>
              <ChevronRight className="w-4 h-4 text-dark-500" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-400 text-sm font-medium border border-red-500/20 rounded-xl bg-red-500/5 active:bg-red-500/10 transition-all mb-8"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </div>
  )
}
