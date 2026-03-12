import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TelegramLogo, Lightning, Buildings, ChartLineUp,
  PaintBrush, Bell, User, MagnifyingGlass, Plus, CaretRight, Megaphone
} from '@phosphor-icons/react'
import { listingsApi, notificationsApi, campaignsApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'

const CATS = [
  { icon: TelegramLogo, label: 'Telegram', to: '/explore?cat=telegram_channel', color: '#2dd4bf' },
  { icon: ChartLineUp, label: 'Media Buyer', to: '/explore?cat=media_buyer', color: '#c8a84b' },
  { icon: Buildings, label: 'Billboard', to: '/explore?cat=billboard', color: '#0d9488' },
  { icon: PaintBrush, label: 'Dizayner', to: '/explore?cat=graphic_designer', color: '#c8a84b' },
]

export default function MiniHomePage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: () => listingsApi.featured().then(r => r.data),
  })

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns-home'],
    queryFn: () => campaignsApi.list({ per_page: 3, status: 'open' }).then(r => r.data),
  })

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
    enabled: isAuthenticated,
  })

  const unread = notifs?.filter(n => !n.is_read).length || 0

  return (
    <div className="min-h-screen bg-obs-900">
      {/* Glow */}
      <div className="pointer-events-none fixed top-0 right-0 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-obs-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <Lightning size={14} color="#fff" weight="fill" />
          </div>
          <span className="font-display text-2xl tracking-widest midas-gradient">MIDAS</span>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button onClick={() => navigate('/notifications')} className="relative w-9 h-9 rounded-xl bg-obs-800 border border-obs-700 flex items-center justify-center active:scale-90">
              <Bell size={17} color="#94a3b8" weight="bold" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-obs-900"
                  style={{ background: '#c8a84b' }}>{unread}</span>
              )}
            </button>
          )}
          {user?.photo_url
            ? <img src={user.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover cursor-pointer border border-obs-700" onClick={() => navigate('/profile')} />
            : <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-xl bg-obs-800 border border-obs-700 flex items-center justify-center">
                <User size={17} color="#64748b" weight="bold" />
              </button>}
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 pt-5 pb-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {isAuthenticated && user ? (
            <div>
              <p className="text-obs-300 text-sm">Xush kelibsiz,</p>
              <h1 className="font-display text-3xl tracking-wide midas-gradient">{user.first_name}!</h1>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-3xl text-white tracking-wide leading-tight">
                Reklama bozori<br />
                <span className="teal-gradient">professional tarzda</span>
              </h1>
              <p className="text-obs-300 text-sm mt-2">Telegram, billboard, media buyer — hammasi bir joyda</p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { val: '1,200+', label: 'Kanal', color: '#2dd4bf' },
            { val: '340+', label: 'Media Buyer', color: '#c8a84b' },
            { val: '5,800+', label: 'Bitim', color: '#2dd4bf' },
          ].map(({ val, label, color }) => (
            <div key={label} className="bg-obs-800 border border-obs-700 rounded-xl p-3 text-center">
              <div className="font-display text-xl" style={{ color }}>{val}</div>
              <div className="text-[10px] text-obs-400 mt-0.5 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/explore"
            className="flex items-center gap-3 p-4 rounded-xl active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <MagnifyingGlass size={16} color="#fff" weight="bold" />
            </div>
            <span className="text-white font-semibold text-sm">Reklama topish</span>
          </Link>
          <button onClick={() => {
            if (!isAuthenticated) { toast.error('Kirish talab etiladi'); return }
            navigate('/campaigns')
          }}
            className="flex items-center gap-3 p-4 bg-obs-800 border border-obs-700 rounded-xl active:scale-95 transition-all">
            <div className="w-8 h-8 rounded-lg bg-obs-700 flex items-center justify-center flex-shrink-0">
              <Plus size={16} color="#c8a84b" weight="bold" />
            </div>
            <span className="text-white font-semibold text-sm">Kampaniya</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-5">
        <p className="text-xs font-bold text-obs-400 uppercase tracking-widest mb-3">Kategoriyalar</p>
        <div className="grid grid-cols-4 gap-2">
          {CATS.map(({ icon: Icon, label, to, color }) => (
            <Link key={label} to={to}
              className="flex flex-col items-center gap-2 p-3 bg-obs-800 border border-obs-700 rounded-xl active:scale-95 transition-all">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} weight="bold" />
              </div>
              <span className="text-[10px] text-obs-300 text-center leading-tight font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured listings */}
      {featured && featured.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-xs font-bold text-obs-400 uppercase tracking-widest">Tanlangan</p>
            <Link to="/explore" className="text-teal-400 text-xs flex items-center gap-0.5 font-medium">
              Hammasi <CaretRight size={12} weight="bold" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {featured.map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex-shrink-0 w-52">
                <Link to={`/listing/${listing.id}`}>
                  <div className="bg-obs-800 border border-obs-700 rounded-2xl overflow-hidden">
                    {listing.cover_image
                      ? <img src={listing.cover_image} alt="" className="w-full h-28 object-cover" />
                      : <div className="w-full h-28 bg-obs-700 flex items-center justify-center">
                          <Megaphone size={28} color="#334155" weight="duotone" />
                        </div>}
                    <div className="p-3">
                      <div className="text-white text-xs font-semibold truncate mb-1">{listing.title}</div>
                      <div className="text-obs-400 text-[10px] mb-2">{listing.city || "O'zbekiston"}</div>
                      <div className="font-bold text-xs" style={{ color: '#c8a84b' }}>
                        {listing.price_from ? formatPrice(listing.price_from) + " so'm" : 'Kelishiladi'}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns */}
      {campaigns?.items && campaigns.items.length > 0 && (
        <div className="px-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-obs-400 uppercase tracking-widest">Ochiq kampaniyalar</p>
            <Link to="/campaigns" className="text-teal-400 text-xs flex items-center gap-0.5 font-medium">
              Hammasi <CaretRight size={12} weight="bold" />
            </Link>
          </div>
          <div className="space-y-2">
            {campaigns.items.map(c => (
              <Link key={c.id} to={`/campaign/${c.id}`}
                className="flex items-center gap-3 p-3 bg-obs-800 border border-obs-700 rounded-xl active:scale-98 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(13,148,136,0.12)' }}>
                  <Megaphone size={16} color="#2dd4bf" weight="bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate">{c.title}</div>
                  <div className="text-obs-400 text-[10px] mt-0.5">
                    {c.budget_min ? `${formatPrice(c.budget_min)} so'mdan` : 'Budjet kelishiladi'}
                    {' · '}{c.proposal_count} taklif
                  </div>
                </div>
                <CaretRight size={14} color="#334155" weight="bold" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
