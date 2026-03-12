import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BadgeCheck, Settings, ChevronRight, LogOut, User,
  Zap, Star, Briefcase, Plus, X, Check
} from 'lucide-react'
import { usersApi, dealsApi, authApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ROLE_LABELS: Record<string, string> = {
  buyer: '🛒 Reklama xaridor',
  provider: '📢 Reklama joyi egasi',
  marketing: '📊 Marketing mutaxassis',
  creative: '🎨 Kreativ mutaxassis',
}

const ROLE_COLORS: Record<string, string> = {
  buyer: '#f59e0b',
  provider: '#29b6f6',
  marketing: '#34d399',
  creative: '#a78bfa',
}

function AddProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [selected, setSelected] = useState('')

  const mutation = useMutation({
    mutationFn: () => usersApi.createProfile({ role: selected, display_name: user?.first_name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-profiles'] })
      toast.success("Profil qo'shildi!")
      onClose()
    },
    onError: () => toast.error('Bu profil allaqachon mavjud'),
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark-950/90 flex flex-col justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-dark-900 border-t border-dark-800 rounded-t-3xl p-4"
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 bg-dark-700 rounded-full" />
        </div>
        <h3 className="text-white font-bold mb-4">Profil qo'shish</h3>
        <div className="space-y-2 mb-4">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              className={clsx(
                'w-full flex items-center justify-between p-3 rounded-xl border transition-all',
                selected === role ? 'border-gold-500/50 bg-gold-500/10' : 'border-dark-800 bg-dark-800'
              )}
            >
              <span className="text-white text-sm">{label}</span>
              {selected === role && <Check className="w-4 h-4 text-gold-400" />}
            </button>
          ))}
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={!selected || mutation.isPending}
          className="btn-primary w-full"
        >
          {mutation.isPending ? '...' : "Qo'shish"}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function MiniProfilePage() {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore()
  const [showAddProfile, setShowAddProfile] = useState(false)

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user as {
    first_name?: string; last_name?: string; username?: string; photo_url?: string
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

  const displayName = user?.first_name || tgUser?.first_name || 'Foydalanuvchi'
  const displayUsername = user?.telegram_username || tgUser?.username
  const displayPhoto = user?.photo_url || tgUser?.photo_url
  const completedDeals = deals?.filter((d) => d.status === 'completed').length || 0
  const activeDeals = deals?.filter((d) => ['in_progress', 'agreed'].includes(d.status)).length || 0

  const handleLogin = () => {
    const tg = window.Telegram?.WebApp
    if (!tg?.initData) { toast.error('Telegram orqali oching'); return }
    const t = toast.loading('Kirilmoqda...')
    authApi.telegramLogin(tg.initData)
      .then((res) => { setAuth(res.data.access_token, res.data.user); toast.dismiss(t); toast.success('Kirildi!') })
      .catch(() => { toast.dismiss(t); toast.error('Xatolik') })
  }

  const menuItems = [
    { label: "E'lonlarim", emoji: '📢', authRequired: true },
    { label: 'Kampaniyalarim', emoji: '🎯', authRequired: true },
    { label: 'Saqlangan', emoji: '❤️', authRequired: true },
    { label: 'Bitimlar', emoji: '🤝', authRequired: true },
    { label: 'Sozlamalar', emoji: '⚙️', authRequired: false },
  ]

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Profil</h1>
      </div>

      <div className="px-4 pt-5">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 overflow-hidden">
              {displayPhoto
                ? <img src={displayPhoto} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><User className="w-7 h-7 text-dark-400" /></div>
              }
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-dark-950" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white text-lg">{displayName}</h2>
            {displayUsername && <p className="text-dark-400 text-sm">@{displayUsername}</p>}
            {!isAuthenticated && (
              <span className="text-[11px] text-amber-400">⚠️ Kiring</span>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { val: profiles?.[0]?.rating?.toFixed(1) || '—', label: 'Reyting', icon: Star },
            { val: completedDeals, label: 'Bitim', icon: Check },
            { val: activeDeals, label: 'Faol', icon: Briefcase },
          ].map(({ val, label }) => (
            <div key={label} className="bg-dark-900 border border-dark-800 rounded-xl p-3 text-center">
              <div className="text-white font-bold text-lg">{val}</div>
              <div className="text-[10px] text-dark-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Login CTA */}
        {!isAuthenticated && (
          <div className="bg-dark-900 border border-gold-500/30 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-gold-400" />
              <p className="text-white font-medium text-sm">Akkauntni faollashtiring</p>
            </div>
            <p className="text-dark-400 text-xs mb-3">E'lon joylashtirish, chat, kampaniya va ko'proq</p>
            <button onClick={handleLogin} className="btn-primary w-full">Telegram orqali kirish</button>
          </div>
        )}

        {/* Profiles */}
        {isAuthenticated && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-dark-400 uppercase tracking-widest font-medium">Profillarim</p>
              <button
                onClick={() => setShowAddProfile(true)}
                className="flex items-center gap-1 text-gold-400 text-xs"
              >
                <Plus className="w-3 h-3" /> Qo'shish
              </button>
            </div>
            {profiles && profiles.length > 0 ? (
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 bg-dark-900 border border-dark-800 rounded-xl"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: `${ROLE_COLORS[p.role] || '#f59e0b'}15` }}
                    >
                      {ROLE_LABELS[p.role]?.split(' ')[0] || '👤'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {ROLE_LABELS[p.role]?.split(' ').slice(1).join(' ') || p.role}
                      </p>
                      {p.rating > 0 && (
                        <p className="text-dark-500 text-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                          {p.rating.toFixed(1)} · {p.review_count} sharh
                        </p>
                      )}
                    </div>
                    {p.verified_badge && <BadgeCheck className="w-4 h-4 text-gold-400" />}
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowAddProfile(true)}
                className="w-full p-3 border border-dashed border-dark-700 rounded-xl text-dark-500 text-sm"
              >
                + Profil qo'shing
              </button>
            )}
          </div>
        )}

        {/* Menu */}
        <div className="space-y-1.5 mb-6">
          {menuItems.map(({ label, emoji, authRequired }) => (
            <button
              key={label}
              onClick={() => {
                if (authRequired && !isAuthenticated) {
                  toast.error(`${label} uchun kirish kerak`, { icon: '🔒' })
                }
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-dark-900 border border-dark-800 rounded-xl active:bg-dark-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{emoji}</span>
                <span className="text-sm text-white">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                {authRequired && !isAuthenticated && <span className="text-[10px] text-dark-600">🔒</span>}
                <ChevronRight className="w-4 h-4 text-dark-600" />
              </div>
            </button>
          ))}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={() => { logout(); toast.success('Chiqildi') }}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-400 text-sm font-medium border border-red-500/20 rounded-xl bg-red-500/5 mb-8"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddProfile && <AddProfileModal onClose={() => setShowAddProfile(false)} />}
      </AnimatePresence>
    </div>
  )
}
