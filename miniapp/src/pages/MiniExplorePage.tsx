import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { listingsApi } from '../utils/api'
import { ListingMiniCard } from '../components/ListingMiniCard'
import clsx from 'clsx'

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

export default function MiniExplorePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['listings', { search, category, page }],
    queryFn: () =>
      listingsApi.list({ search: search || undefined, category: category || undefined, page, per_page: 12 })
        .then((r) => r.data),
  })

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            className="input pl-10 text-sm py-2.5"
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
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {CATS.map(({ v, l }) => (
            <button
              key={v}
              onClick={() => { setCategory(v); setPage(1) }}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                category === v
                  ? 'bg-gold-500 text-dark-950'
                  : 'bg-dark-800 text-dark-400'
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
                <div className="h-28 shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-3 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {data?.items.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ListingMiniCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex gap-2 justify-center mt-6 flex-wrap">
            {Array.from({ length: Math.min(data.pages, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                  page === i + 1 ? 'bg-gold-500 text-dark-950' : 'bg-dark-800 text-dark-400'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
