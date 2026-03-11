import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star, Handshake, BadgeCheck, Settings, ChevronRight,
  Plus, LogOut, User, Send
} from 'lucide-react'
import { usersApi, dealsApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'

export default function MiniProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore()

  // Telegram dan to'g'ridan-to'g'ri user ma'lumotlarini olish (fallback)
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user as {
    first_name?: string
    last_name?: string
    username?: string
    photo_url?: string
  } | undefined

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

  // Agar login bo'lmagan bo'lsa, Telegram ma'lumotlarini ko'rsatamiz
  const displayName = user?.first_name || tgUser?.first_name || 'Foydalanuvchi'
  const displayUsername = user?.telegram_username || tgUser?.username
  const displayPhoto = user?.photo_url || tgUser?.photo_url

  const completedDeals = deals?.filter((d) => d.status === 'completed').length || 0
  const activeDeals = deals?.filter((d) => ['in_progress', 'agreed'].includes(d.status)).length || 0
  const primaryProfile = profiles?.[0]

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
              {displayPhoto
                ? <img src={displayPhoto} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <User className="w-7 h-7 text-dark-400" />
                  </div>
              }
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-dark-950" />
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">{displayName}</h2>
            {displayUsername && (
              <p className="text-dark-400 text-sm">@{displayUsername}</p>
            )}
            {!isAuthenticated && (
              <span className="text-[11px] text-gold-400 mt-0.5 block">
                Telegram orqali ulangan
              </span>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { val: primaryProfile?.rating?.toFixed(1) || '—', label: 'Reyting', color: '#f59e0b' },
            { val: completedDeals, label: 'Bitim', color: '#34d399' },
            { val: activeDeals, label: 'Faol', color: '#29b6f6' },
          ].map(({ val, label, color }) => (
            <div key={label} className="bg-dark-900 border border-dark-800 rounded-xl p-3 text-center">
              <div className="text-white font-bold text-lg">{val}</div>
              <div className="text-[10px] text-dark-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Agar login bo'lmagan bo'lsa — to'liq kirish tugmasi */}
        {!isAuthenticated && (
          <div className="bg-dark-900 border border-gold-500/20 rounded-xl p-4 mb-5">
            <p className="text-sm text-dark-300 mb-3 text-center">
              To'liq imkoniyatlar uchun akkauntni faollashtiring
            </p>
            <button
              onClick={() => {
                const tg = window.Telegram?.WebApp
                if (tg?.initData) {
                  import('../utils/api').then(({ authApi }) => {
                    authApi.telegramLogin(tg.initData).then((res) => {
                      useAuthStore.getState().setAuth(res.data.access_token, res.data.user)
                    })
                  })
                }
              }}
              className="btn-primary w-full"
            >
              Faollashtirish
            </button>
          </div>
        )}

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

        {/* Logout — faqat login bo'lgan bo'lsa */}
        {isAuthenticated && (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-400 text-sm font-medium border border-red-500/20 rounded-xl bg-red-500/5 active:bg-red-500/10 transition-all mb-8"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        )}
      </div>
    </div>
  )
}
