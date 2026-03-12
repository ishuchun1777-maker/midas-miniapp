import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Users, Eye, Star } from '@phosphor-icons/react'
import { listingsApi } from '../utils/api'
import { formatPrice, formatNumber } from '../utils/format'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => listingsApi.favorites().then(r => r.data),
  })

  const removeFav = useMutation({
    mutationFn: (id: number) => listingsApi.toggleFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
      toast.success("Saqlanganlardan o'chirildi")
    },
  })

  return (
    <div className="min-h-screen bg-obs-900">
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <h1 className="flex-1 text-white font-bold text-base">Saqlangan</h1>
        <Heart size={18} color="#c8a84b" weight="fill" />
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-obs-800 rounded-2xl shimmer" />)}
          </div>
        ) : !favorites?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-obs-800 flex items-center justify-center mb-4">
              <Heart size={32} color="#334155" weight="duotone" />
            </div>
            <p className="text-obs-300 font-medium">Saqlangan e'lonlar yo'q</p>
            <p className="text-obs-400 text-sm mt-1">E'lonlarda ♡ belgisini bosing</p>
            <button onClick={() => navigate('/explore')} className="btn-primary mt-4 text-sm">
              E'lonlarni ko'rish
            </button>
          </div>
        ) : (
          <>
            <p className="text-obs-400 text-xs font-medium mb-3">{favorites.length} ta saqlangan</p>
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="relative">
                  <Link to={`/listing/${listing.id}`}>
                    <div className="bg-obs-800 border border-obs-700 rounded-2xl overflow-hidden active:scale-[0.98] transition-all">
                      {listing.cover_image
                        ? <img src={listing.cover_image} alt="" className="w-full h-28 object-cover" />
                        : <div className="w-full h-20 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.1),rgba(200,168,75,0.05))' }}>
                            <Heart size={24} color="#334155" weight="duotone" />
                          </div>}
                      <div className="p-3">
                        <div className="text-white text-xs font-semibold line-clamp-1 mb-1">{listing.title}</div>
                        {listing.city && <div className="text-obs-400 text-[10px] mb-2">{listing.city}</div>}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs" style={{ color: '#c8a84b' }}>
                            {listing.price_from ? formatPrice(listing.price_from) + " so'm" : 'Kelishiladi'}
                          </span>
                          {listing.subscriber_count && (
                            <span className="flex items-center gap-0.5 text-[10px] text-obs-400">
                              <Users size={9} weight="bold" />{formatNumber(listing.subscriber_count)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Remove button */}
                  <button onClick={() => removeFav.mutate(listing.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(6,8,9,0.8)' }}>
                    <Heart size={14} color="#c8a84b" weight="fill" />
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
