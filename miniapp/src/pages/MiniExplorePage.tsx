import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MessageSquare, Heart, Star, Users, Eye, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listingsApi, chatApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import { Listing } from '../utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

const CATS = [
  { v: '', l: 'Barcha' },
  { v: 'telegram_channel', l: 'Telegram' },
  { v: 'youtube_creator', l: 'YouTube' },
  { v: 'billboard', l: 'Billboard' },
  { v: 'led_screen', l: 'LED' },
  { v: 'media_buyer', l: 'Media Buyer' },
  { v: 'graphic_designer', l: 'Dizayner' },
  { v: 'smm', l: 'SMM' },
]

const CAT_LABELS: Record<string, string> = {
  telegram_channel: 'Telegram kanal',
  youtube_creator: 'YouTube',
  billboard: 'Billboard',
  led_screen: 'LED ekran',
  media_buyer: 'Media Buyer',
  graphic_designer: 'Dizayner',
  smm: 'SMM',
}

function ListingCard({ listing, onContact }: { listing: Listing; onContact: (l: Listing) => void }) {
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(!saved)
    listingsApi.toggleFavorite(listing.id).catch(() => setSaved(saved))
    toast.success(saved ? 'Saqlangandan olib tashlandi' : 'Saqlandi', { duration: 1500 })
  }

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
      {/* Cover */}
      <div className="relative h-32">
        {listing.cover_image ? (
          <img src={listing.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-dark-800 flex items-center justify-center">
            <div className="text-4xl opacity-30">📢</div>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {listing.verified && (
            <span className="px-1.5 py-0.5 bg-gold-500 rounded-md text-[9px] font-bold text-dark-950">✓</span>
          )}
          <button
            onClick={handleSave}
            className="w-7 h-7 rounded-lg bg-dark-950/70 flex items-center justify-center"
          >
            <Heart className={clsx('w-3.5 h-3.5', saved ? 'fill-red-400 text-red-400' : 'text-white')} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-0.5 bg-dark-950/80 rounded-md text-[10px] text-dark-300">
            {CAT_LABELS[listing.category] || listing.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-white text-sm font-semibold truncate mb-1">{listing.title}</div>

        <div className="flex items-center gap-2 mb-2">
          {listing.rating > 0 && (
            <div className="flex items-center gap-0.5 text-gold-400">
              <Star className="w-3 h-3 fill-gold-400" />
              <span className="text-[11px] font-medium">{listing.rating.toFixed(1)}</span>
            </div>
          )}
          {listing.subscriber_count && (
            <div className="flex items-center gap-0.5 text-dark-400">
              <Users className="w-3 h-3" />
              <span className="text-[11px]">
                {listing.subscriber_count >= 1000
                  ? `${(listing.subscriber_count / 1000).toFixed(1)}K`
                  : listing.subscriber_count}
              </span>
            </div>
          )}
          {listing.avg_views && (
            <div className="flex items-center gap-0.5 text-dark-400">
              <Eye className="w-3 h-3" />
              <span className="text-[11px]">
                {listing.avg_views >= 1000
                  ? `${(listing.avg_views / 1000).toFixed(1)}K`
                  : listing.avg_views}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {listing.price_from ? (
              <div className="text-gold-400 text-xs font-bold">
                {formatPrice(listing.price_from, listing.currency)}
                {listing.pricing_type === 'negotiable' && <span className="text-dark-500 font-normal"> dan</span>}
              </div>
            ) : (
              <div className="text-dark-400 text-xs">Narx kelishiladi</div>
            )}
          </div>
          <button
            onClick={() => onContact(listing)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-lg text-gold-400 text-[11px] font-medium active:bg-gold-500/20 transition-all"
          >
            <MessageSquare className="w-3 h-3" />
            Aloqa
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MiniExplorePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['listings', { search, category, page }],
    queryFn: () =>
      listingsApi.list({ search: search || undefined, category: category || undefined, page, per_page: 12 })
        .then((r) => r.data),
  })

  const handleContact = async (listing: Listing) => {
    if (!isAuthenticated) {
      toast.error("Aloqa qilish uchun kirish kerak", { icon: '🔒' })
      return
    }
    try {
      const res = await chatApi.startConversation(listing.owner.id, listing.id)
      toast.success("Chat ochildi!")
      navigate('/messages')
    } catch {
      toast.error("Xatolik yuz berdi")
    }
  }

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            className="input pl-10 text-sm py-2.5 w-full"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-dark-400" />
            </button>
          )}
          </div>
          <Link
            to="/listing/create"
            className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
          >
            <Plus className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {CATS.map(({ v, l }) => (
            <button
              key={v}
              onClick={() => { setCategory(v); setPage(1) }}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                category === v ? 'bg-gold-500 text-dark-950' : 'bg-dark-800 text-dark-400'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {data && (
          <p className="text-[11px] text-dark-500 mb-3">
            <span className="text-white">{data.total}</span> ta natija
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
                <div className="h-32 shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-3 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-dark-400 text-sm">Hech narsa topilmadi</p>
            <button
              onClick={() => { setSearch(''); setCategory('') }}
              className="text-gold-400 text-xs mt-2"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {data?.items?.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ListingCard listing={listing} onContact={handleContact} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-dark-800 rounded-xl text-sm text-dark-300 disabled:opacity-40"
                >
                  ← Oldingi
                </button>
                <span className="text-dark-400 text-sm">{page} / {data.pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="px-4 py-2 bg-dark-800 rounded-xl text-sm text-dark-300 disabled:opacity-40"
                >
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
