import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Lightning, User, BadgeCheck, Star, Handshake, Plus,
  SignOut, CaretRight, X, CheckCircle, Circle,
  Megaphone, Target, Heart, ChartLine, ShieldCheck, TelegramLogo
} from '@phosphor-icons/react'
import { usersApi, dealsApi, authApi, listingsApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  buyer:               { label: 'Reklama xaridor',    color: '#c8a84b' },
  audience_owner:      { label: 'Reklama joyi egasi', color: '#2dd4bf' },
  marketing_operator:  { label: 'Marketing operator', color: '#0d9488' },
  creative_provider:   { label: 'Kreativ provider',   color: '#c8a84b' },
  // legacy
  provider:            { label: "E'lon egasi",         color: '#2dd4bf' },
  marketing:           { label: 'Marketing',           color: '#0d9488' },
  creative:            { label: 'Kreativ',             color: '#c8a84b' },
}

function AddProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [selected, setSelected] = useState('')

  const roles = [
    { id: 'buyer',              label: "Reklama xaridor",     desc: "Kanal, billboard topish" },
    { id: 'audience_owner',     label: "Reklama joyi egasi",  desc: "Kanal, billboard, LED" },
    { id: 'marketing_operator', label: "Marketing operator",  desc: "Media buyer, targetolog" },
    { id: 'creative_provider',  label: "Kreativ provider",    desc: "Dizayner, video maker" },
  ]

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(6,8,9,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="rounded-t-3xl border-t border-obs-700 p-4" style={{ background: '#0f1419' }}>
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 bg-obs-600 rounded-full" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">Rol qo'shish</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-obs-800 flex items-center justify-center">
            <X size={14} color="#64748b" weight="bold" />
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {roles.map(({ id, label, desc }) => (
            <button key={id} onClick={() => setSelected(id)}
              className="w-full flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-[0.98]"
              style={{ borderColor: selected === id ? 'rgba(13,148,136,0.4)' : '#1a2530', background: selected === id ? 'rgba(13,148,136,0.08)' : '#0f1419' }}>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-obs-400 text-xs">{desc}</p>
              </div>
              {selected === id
                ? <CheckCircle size={20} color="#0d9488" weight="fill" />
                : <Circle size={20} color="#334155" />}
            </button>
          ))}
        </div>
        <button onClick={() => mutation.mutate()} disabled={!selected || mutation.isPending}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all"
          style={selected ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : { background: '#1a2530', color: '#475569' }}>
          {mutation.isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : "Qo'shish"}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function MiniProfilePage() {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [showAddProfile, setShowAddProfile] = useState(false)

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user as {
    first_name?: string; last_name?: string; username?: string; photo_url?: string
  } | undefined

  const { data: profiles } = useQuery({
    queryKey: ['my-profiles'],
    queryFn: () => usersApi.myProfiles().then(r => r.data),
    enabled: isAuthenticated,
  })

  const { data: deals } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list().then(r => r.data),
    enabled: isAuthenticated,
  })

  const { data: myListings } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingsApi.list({ owner: 'me', per_page: 50 }).then(r => r.data),
    enabled: isAuthenticated,
  })

  const displayName = user?.first_name || tgUser?.first_name || 'Foydalanuvchi'
  const displayUsername = user?.telegram_username || tgUser?.username
  const displayPhoto = user?.photo_url || tgUser?.photo_url
  const completedDeals = deals?.filter(d => d.status === 'completed').length || 0
  const activeDeals = deals?.filter(d => ['pending', 'active'].includes(d.status)).length || 0
  const listingsCount = myListings?.total || 0
  const avgRating = profiles?.[0]?.rating || 0

  const handleLogin = () => {
    const tg = window.Telegram?.WebApp
    if (!tg?.initData) { toast.error("Telegram orqali oching"); return }
    const t = toast.loading('Kirilmoqda...')
    authApi.telegramLogin(tg.initData)
      .then(res => {
        setAuth(res.data.access_token, res.data.user)
        toast.dismiss(t)
        toast.success("Kirildi!")
      })
      .catch(() => { toast.dismiss(t); toast.error("Xatolik") })
  }

  const menuItems = [
    { label: "E'lonlarim",     icon: Megaphone,    to: '/listing/create', badge: listingsCount > 0 ? String(listingsCount) : undefined, authRequired: true },
    { label: 'Kampaniyalarim', icon: Target,       to: '/campaigns',      badge: undefined,                                              authRequired: true },
    { label: 'Saqlangan',      icon: Heart,        to: '/favorites',      badge: undefined,                                              authRequired: true },
    { label: 'Bitimlar',       icon: Handshake,    to: '/deals',          badge: activeDeals > 0 ? String(activeDeals) : undefined,      authRequired: true },
    { label: 'Tahlil',         icon: ChartLine,    to: '/analytics',      badge: undefined,                                              authRequired: true },
    { label: 'Verifikatsiya',  icon: ShieldCheck,  to: '/verification',   badge: undefined,                                              authRequired: true },
  ]

  return (
    <div className="min-h-screen bg-obs-900">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Profil</h1>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <Lightning size={12} color="#fff" weight="fill" />
          </div>
          <span className="font-display text-lg tracking-widest midas-gradient">MIDAS</span>
        </div>
      </div>

      <div className="px-4 pt-5 pb-28">
        {/* User card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-obs-800 border border-obs-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2"
                style={{ borderColor: isAuthenticated ? 'rgba(13,148,136,0.4)' : '#1a2530' }}>
                {displayPhoto
                  ? <img src={displayPhoto} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-obs-700 flex items-center justify-center">
                      <User size={28} color="#64748b" weight="bold" />
                    </div>}
              </div>
              {user?.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#c8a84b' }}>
                  <BadgeCheck size={12} color="#060809" weight="fill" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-lg truncate">{displayName}</h2>
              {displayUsername && <p className="text-obs-300 text-sm">@{displayUsername}</p>}
              {isAuthenticated
                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1"
                    style={{ background: 'rgba(13,148,136,0.1)', color: '#2dd4bf' }}>
                    <CheckCircle size={10} weight="fill" /> Tasdiqlangan
                  </span>
                : <span className="text-[10px] text-gold-500 font-medium">Kiring →</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: avgRating > 0 ? avgRating.toFixed(1) : '—', label: 'Reyting', color: '#c8a84b' },
              { val: listingsCount,      label: "E'lon",   color: '#2dd4bf' },
              { val: completedDeals,     label: 'Bitim',   color: '#0d9488' },
              { val: activeDeals,        label: 'Faol',    color: '#c8a84b' },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center p-2 bg-obs-700 rounded-xl">
                <div className="font-bold text-sm" style={{ color }}>{val}</div>
                <div className="text-[10px] text-obs-400 mt-0.5 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Login CTA */}
        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl border mb-4"
            style={{ background: 'rgba(13,148,136,0.06)', borderColor: 'rgba(13,148,136,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TelegramLogo size={18} color="#2dd4bf" weight="fill" />
              <p className="text-white font-semibold text-sm">Akkauntni faollashtiring</p>
            </div>
            <p className="text-obs-300 text-xs mb-3">E'lon, chat, kampaniya va ko'proq imkoniyatlar</p>
            <button onClick={handleLogin}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
              <TelegramLogo size={16} weight="fill" /> Telegram orqali kirish
            </button>
          </motion.div>
        )}

        {/* My profiles / roles */}
        {isAuthenticated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-obs-400 uppercase tracking-widest">Profillarim</p>
              <button onClick={() => setShowAddProfile(true)}
                className="flex items-center gap-1 text-teal-400 text-xs font-semibold">
                <Plus size={12} weight="bold" /> Qo'shish
              </button>
            </div>

            {profiles && profiles.length > 0 ? (
              <div className="space-y-2">
                {profiles.map(p => {
                  const cfg = ROLE_CONFIG[p.role] || { label: p.role, color: '#64748b' }
                  return (
                    <div key={p.id}
                      className="flex items-center gap-3 p-3 bg-obs-800 border border-obs-700 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cfg.color}18` }}>
                        <User size={16} style={{ color: cfg.color }} weight="bold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{cfg.label}</p>
                        {p.rating > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={10} color="#c8a84b" weight="fill" />
                            <span className="text-obs-300 text-[10px]">{p.rating.toFixed(1)} · {p.review_count} sharh</span>
                          </div>
                        )}
                      </div>
                      {p.verified_badge && <BadgeCheck size={16} color="#c8a84b" weight="fill" />}
                    </div>
                  )
                })}
              </div>
            ) : (
              <button onClick={() => setShowAddProfile(true)}
                className="w-full p-4 border-2 border-dashed border-obs-700 rounded-2xl text-obs-400 text-sm flex items-center justify-center gap-2">
                <Plus size={16} weight="bold" /> Rol qo'shish
              </button>
            )}
          </motion.div>
        )}

        {/* Menu */}
        <div className="space-y-2 mb-6">
          {menuItems.map(({ label, icon: Icon, to, badge, authRequired }, i) => (
            <motion.button key={label}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => {
                if (authRequired && !isAuthenticated) {
                  toast.error(`${label} uchun kirish kerak`)
                  return
                }
                navigate(to)
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-obs-800 border border-obs-700 rounded-2xl active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(13,148,136,0.1)' }}>
                  <Icon size={16} color="#2dd4bf" weight="bold" />
                </div>
                <span className="text-sm text-white font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                {badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(200,168,75,0.15)', color: '#c8a84b' }}>{badge}</span>
                )}
                {authRequired && !isAuthenticated
                  ? <span className="text-[10px] text-obs-500">🔒</span>
                  : <CaretRight size={14} color="#334155" weight="bold" />}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <button onClick={() => { logout(); toast.success('Chiqildi') }}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-red-400 text-sm font-bold rounded-2xl border border-red-500/20 active:scale-95 transition-all"
            style={{ background: 'rgba(239,68,68,0.05)' }}>
            <SignOut size={16} weight="bold" /> Chiqish
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddProfile && <AddProfileModal onClose={() => setShowAddProfile(false)} />}
      </AnimatePresence>
    </div>
  )
}
