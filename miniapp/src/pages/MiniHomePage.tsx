import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, TrendingUp, Monitor, Users, Zap, Bell, ChevronRight, Megaphone } from 'lucide-react'
import { listingsApi, notificationsApi } from '../utils/api'
import { ListingMiniCard } from '../components/ListingMiniCard'
import { useAuthStore } from '../store/authStore'

const CATEGORIES = [
  { icon: Send, label: 'Telegram', to: '/explore?cat=telegram_channel', color: '#29b6f6' },
  { icon: TrendingUp, label: 'Media Buyer', to: '/explore?cat=media_buyer', color: '#f59e0b' },
  { icon: Monitor, label: 'LED/Billboard', to: '/explore?cat=led_screen', color: '#a78bfa' },
  { icon: Users, label: 'Dizayner', to: '/explore?cat=graphic_designer', color: '#34d399' },
]

export default function MiniHomePage() {
  const { user, isAuthenticated } = useAuthStore()

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: () => listingsApi.featured().then((r) => r.data),
  })

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data),
    enabled: isAuthenticated,
  })

  const unreadCount = notifs?.filter((n) => !n.is_read).length || 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-dark-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-dark-950" fill="currentColor" />
          </div>
          <span className="font-display text-2xl tracking-widest text-white">MIDAS</span>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link to="/notifications" className="relative w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center">
              <Bell className="w-4 h-4 text-dark-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 rounded-full text-[9px] font-bold text-dark-950 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {user?.photo_url ? (
            <img src={user.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center">
              <Users className="w-4 h-4 text-dark-400" />
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 pt-5 pb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          {isAuthenticated && user ? (
            <div>
              <p className="text-dark-400 text-sm">Xush kelibsiz,</p>
              <h1 className="font-display text-3xl text-white tracking-wide">{user.first_name}!</h1>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-3xl text-white tracking-wide leading-tight">
                Reklama bozori<br />
                <span className="gold-gradient">professional tarzda</span>
              </h1>
            </div>
          )}
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { val: '1,200+', label: 'Kanal' },
            { val: '340+', label: 'Media Buyer' },
            { val: '5,800+', label: 'Bitim' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-dark-900 border border-dark-800 rounded-xl p-3 text-center">
              <div className="font-display text-xl text-gold-400">{val}</div>
              <div className="text-[10px] text-dark-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/explore"
            className="bg-gold-500 hover:bg-gold-400 rounded-xl p-4 flex items-center gap-3 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-dark-950/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-dark-950" />
            </div>
            <span className="text-dark-950 font-semibold text-sm">Reklama topish</span>
          </Link>
          <Link
            to="/campaigns"
            className="bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl p-4 flex items-center gap-3 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-4 h-4 text-gold-400" />
            </div>
            <span className="text-white font-semibold text-sm">Kampaniya</span>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-dark-400 uppercase tracking-widest">Kategoriyalar</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(({ icon: Icon, label, to, color }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 p-3 bg-dark-900 border border-dark-800 rounded-xl active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-[10px] text-dark-400 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <span className="text-xs font-medium text-dark-400 uppercase tracking-widest">Tanlangan</span>
            <Link to="/explore" className="text-gold-400 text-xs flex items-center gap-0.5">
              Hammasi <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {featured.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex-shrink-0 w-56"
              >
                <ListingMiniCard listing={listing} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
