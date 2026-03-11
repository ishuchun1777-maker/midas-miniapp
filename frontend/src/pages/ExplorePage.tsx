import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, Filter, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { listingsApi } from '@/utils/api'
import { ListingCard, ListingCardSkeleton } from '@/components/marketplace/ListingCard'
import clsx from 'clsx'

const CATEGORIES = [
  { value: '', label: 'Barcha' },
  { value: 'telegram_channel', label: 'Telegram' },
  { value: 'youtube_creator', label: 'YouTube' },
  { value: 'billboard', label: 'Billboard' },
  { value: 'led_screen', label: 'LED Ekran' },
  { value: 'media_buyer', label: 'Media Buyer' },
  { value: 'targetologist', label: 'Targetolog' },
  { value: 'smm', label: 'SMM' },
  { value: 'marketing_agency', label: 'Agentlik' },
  { value: 'graphic_designer', label: 'Dizayner' },
  { value: 'video_maker', label: 'Video Maker' },
  { value: 'copywriter', label: 'Copywriter' },
]

const CITIES = ['Toshkent', 'Samarqand', 'Buxoro', 'Namangan', "Andijon", "Farg'ona"]

export default function ExplorePage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [city, setCity] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const queryParams = {
    category: category || undefined,
    city: city || undefined,
    search: search || undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    verified_only: verifiedOnly || undefined,
    page,
    per_page: 18,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['listings', queryParams],
    queryFn: () => listingsApi.list(queryParams).then((r) => r.data),
  })

  const activeFiltersCount = [category, city, minPrice, maxPrice, verifiedOnly].filter(Boolean).length

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ─── FILTER SIDEBAR ──────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-64 border-r border-dark-800 bg-dark-950 p-5 overflow-y-auto flex-shrink-0"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-white">Filtrlar</span>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4 text-dark-400" />
              </button>
            </div>

            {/* City */}
            <div className="mb-5">
              <label className="label">Shahar</label>
              <select
                className="input text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Barcha shaharlar</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="mb-5">
              <label className="label">Narx (so'm)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input text-sm"
                  placeholder="Dan"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  className="input text-sm"
                  placeholder="Gacha"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Verified */}
            <label className="flex items-center gap-3 cursor-pointer mb-5">
              <div
                className={clsx(
                  'w-10 h-6 rounded-full transition-colors relative',
                  verifiedOnly ? 'bg-gold-500' : 'bg-dark-700'
                )}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
              >
                <div
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    verifiedOnly ? 'left-5' : 'left-1'
                  )}
                />
              </div>
              <span className="text-sm text-dark-300">Faqat tasdiqlanganlar</span>
            </label>

            <button
              className="btn-ghost text-red-400 hover:text-red-300 text-sm w-full justify-center"
              onClick={() => { setCity(''); setMinPrice(''); setMaxPrice(''); setVerifiedOnly(false) }}
            >
              Filtrlarni tozalash
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-dark-800 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                className="input pl-10 text-sm"
                placeholder={t('listing.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                showFilters || activeFiltersCount > 0
                  ? 'border-gold-500/40 text-gold-400 bg-gold-500/10'
                  : 'border-dark-700 text-dark-400 hover:text-white hover:border-dark-600'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('listing.filter')}
              {activeFiltersCount > 0 && (
                <span className="bg-gold-500 text-dark-950 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View mode */}
            <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx('p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-dark-600 text-white' : 'text-dark-400')}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-dark-600 text-white' : 'text-dark-400')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5 scrollbar-hide">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setCategory(value); setPage(1) }}
                className={clsx(
                  'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  category === value
                    ? 'bg-gold-500 text-dark-950'
                    : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-6">
          {data && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-dark-400">
                <span className="text-white font-medium">{data.total}</span> ta natija topildi
              </span>
            </div>
          )}

          {isLoading ? (
            <div className={clsx('grid gap-4', viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
              {Array.from({ length: 9 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className={clsx('grid gap-4', viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
              <AnimatePresence mode="popLayout">
                {data?.items.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: data.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={clsx(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                    page === i + 1
                      ? 'bg-gold-500 text-dark-950'
                      : 'bg-dark-800 text-dark-400 hover:text-white'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
