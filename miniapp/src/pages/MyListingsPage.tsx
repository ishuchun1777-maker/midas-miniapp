import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Plus, Eye, Heart, TrendingUp } from '@phosphor-icons/react'
import { listingsApi, Listing } from '../utils/api'
import { formatPrice } from '../utils/format'

export default function MyListingsPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings-page'],
    queryFn: () => listingsApi.mine().then(r => r.data),
  })

  const listings: Listing[] = data?.items || []

  return (
    <div className="min-h-screen bg-obs-900">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <h1 className="text-white font-bold text-base flex-1">Mening e'lonlarim</h1>
        <button onClick={() => navigate('/listing/create')}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90"
          style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
          <Plus size={18} color="#fff" weight="bold" />
        </button>
      </div>

      <div className="p-4">
        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-obs-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-obs-800 flex items-center justify-center mb-4">
              <TrendingUp size={32} color="#334155" weight="duotone" />
            </div>
            <p className="text-obs-300 font-semibold mb-1">Hali e'lon yo'q</p>
            <p className="text-obs-400 text-sm mb-5">Birinchi e'loningizni yarating</p>
            <button onClick={() => navigate('/listing/create')}
              className="px-6 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
              E'lon yaratish
            </button>
          </div>
        )}

        {!isLoading && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((l: Listing) => (
              <button key={l.id} onClick={() => navigate(`/listing/${l.id}`)}
                className="w-full text-left bg-obs-800 border border-obs-700 rounded-2xl p-4 active:scale-[0.98] transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{l.title}</p>
                    <p className="text-obs-400 text-xs mt-0.5">{l.category?.replace(/_/g,' ')}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                    style={{
                      background: l.status === 'active' ? 'rgba(13,148,136,0.15)' : 'rgba(100,116,139,0.15)',
                      color: l.status === 'active' ? '#2dd4bf' : '#64748b'
                    }}>
                    {l.status === 'active' ? 'Faol' : l.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-obs-400 text-xs">
                    <Eye size={12} weight="bold" /> {l.view_count || 0}
                  </span>
                  <span className="flex items-center gap-1 text-obs-400 text-xs">
                    <Heart size={12} weight="bold" /> {l.save_count || 0}
                  </span>
                  <span className="text-teal-400 text-xs font-semibold ml-auto">
                    {l.price_from
                      ? formatPrice(l.price_from, l.currency)
                      : l.pricing_type === 'negotiable' ? 'Kelishiladi' : 'Taklif asosida'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
