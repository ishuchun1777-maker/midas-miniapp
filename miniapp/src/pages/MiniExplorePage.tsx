import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  MagnifyingGlass, X, Heart, Star, Users, Eye, CaretRight,
  TelegramLogo, YoutubeLogo, InstagramLogo, Buildings, Monitor, Plus
} from '@phosphor-icons/react'
import { listingsApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice, formatNumber } from '../utils/format'
import { Listing } from '../utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

import { useI18n } from '../i18n/I18nContext'

const CATS = [
  { id: '', label: 'Hammasi' },
  { id: 'telegram_channel', label: 'Telegram', icon: TelegramLogo },
  { id: 'youtube_creator', label: 'YouTube', icon: YoutubeLogo },
  { id: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { id: 'billboard', label: 'Billboard', icon: Buildings },
  { id: 'led_screen', label: 'LED', icon: Monitor },
  { id: 'media_buyer', label: 'Media Buyer' },
  { id: 'graphic_designer', label: 'Dizayner' },
]

function ListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Kirish talab etiladi'); return }
    navigate(`/messages`)
  }

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="bg-obs-800 border border-obs-700 rounded-2xl overflow-hidden active:scale-[0.98] transition-all">
        {/* Cover */}
        {listing.cover_image
          ? <img src={listing.cover_image} alt="" className="w-full h-36 object-cover" />
          : <div className="w-full h-24 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.1), rgba(200,168,75,0.05))' }}>
              <TelegramLogo size={28} color="#0d9488" weight="duotone" />
            </div>}

        <div className="p-3">
          {/* Badges */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(13,148,136,0.12)', color: '#2dd4bf' }}>
              {listing.category.replace(/_/g,' ')}
            </span>
            {listing.verified && <Star size={10} color="#c8a84b" weight="fill" />}
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{listing.title}</h3>
          {listing.city && <p className="text-obs-400 text-[10px] mb-2">{listing.city}</p>}

          {/* Stats */}
          <div className="flex items-center gap-3 mb-3 text-[10px] text-obs-300">
            {listing.subscriber_count && (
              <span className="flex items-center gap-1">
                <Users size={10} weight="bold" />{formatNumber(listing.subscriber_count)}
              </span>
            )}
            {listing.avg_views && (
              <span className="flex items-center gap-1">
                <Eye size={10} weight="bold" />{formatNumber(listing.avg_views)}
              </span>
            )}
            {listing.review_count > 0 && (
              <span className="flex items-center gap-1">
                <Star size={10} weight="fill" color="#c8a84b" />{listing.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Price + action */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm" style={{ color: '#c8a84b' }}>
              {listing.price_from
                ? formatPrice(listing.price_from) + " so'm"
                : 'Kelishiladi'}
            </span>
            <button onClick={handleContact}
              className="text-[10px] font-bold px-3 py-1.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
              Aloqa
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function MiniExplorePage() {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')
  const [page, setPage] = useState(1)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['listings', search, cat, page],
    queryFn: () => listingsApi.list({
      search: search || undefined,
      category: cat || undefined,
      page,
      per_page: 12,
    }).then(r => r.data),
  })

  return (
    <div className="min-h-screen bg-obs-900">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3">
        {/* Search + add */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} color="#64748b" weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9 py-2.5 text-sm" placeholder={t('search')}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} color="#64748b" weight="bold" />
              </button>
            )}
          </div>
          <button onClick={() => {
            if (!isAuthenticated) { toast.error('E\'lon qo\'shish uchun kirish kerak'); return }
            navigate('/listing/create')
          }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <Plus size={18} color="#fff" weight="bold" />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {CATS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setCat(id); setPage(1) }}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all',
                cat === id ? 'text-white' : 'bg-obs-800 text-obs-300 border border-obs-700'
              )}
              style={cat === id ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : {}}>
              {Icon && <Icon size={12} weight="bold" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-56 bg-obs-800 rounded-2xl shimmer" />)}
          </div>
        ) : !data?.items?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MagnifyingGlass size={40} color="#334155" weight="duotone" />
            <p className="text-obs-300 mt-3 font-medium">E'lonlar topilmadi</p>
            <p className="text-obs-400 text-sm mt-1">Qidiruv yoki filtrni o'zgartiring</p>
          </div>
        ) : (
          <>
            <p className="text-obs-400 text-xs mb-3 font-medium">{data.total} ta e'lon topildi</p>
            <div className="grid grid-cols-2 gap-3">
              {data.items.map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className={clsx('px-4 py-2 rounded-xl text-sm font-bold transition-all', page <= 1 ? 'bg-obs-800 text-obs-500' : 'bg-obs-800 border border-obs-600 text-white active:scale-95')}>
                  ← Oldingi
                </button>
                <span className="px-4 py-2 text-obs-300 text-sm">{page} / {data.pages}</span>
                <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
                  className={clsx('px-4 py-2 rounded-xl text-sm font-bold transition-all', page >= data.pages ? 'bg-obs-800 text-obs-500' : 'bg-obs-800 border border-obs-600 text-white active:scale-95')}>
                  Keyingi →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
