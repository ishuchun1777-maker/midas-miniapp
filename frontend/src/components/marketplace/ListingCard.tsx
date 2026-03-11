import { Link } from 'react-router-dom'
import { Send, Star, Eye, Users, TrendingUp, MapPin, BadgeCheck, Bookmark } from 'lucide-react'
import { Listing, listingsApi } from '@/utils/api'
import { formatNumber, formatPrice } from '@/utils/format'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'

const CATEGORY_ICONS: Record<string, { icon: typeof Send; color: string; label: string }> = {
  telegram_channel: { icon: Send, color: '#29b6f6', label: 'Telegram' },
  youtube_creator: { icon: TrendingUp, color: '#ef4444', label: 'YouTube' },
  billboard: { icon: MapPin, color: '#a78bfa', label: 'Billboard' },
  led_screen: { icon: Eye, color: '#a78bfa', label: 'LED' },
  media_buyer: { icon: TrendingUp, color: '#f59e0b', label: 'Media Buyer' },
  graphic_designer: { icon: Users, color: '#fb923c', label: 'Designer' },
  smm: { icon: Users, color: '#34d399', label: 'SMM' },
}

interface ListingCardProps {
  listing: Listing
  compact?: boolean
}

export function ListingCard({ listing, compact }: ListingCardProps) {
  const qc = useQueryClient()
  const catInfo = CATEGORY_ICONS[listing.category] || { icon: Send, color: '#737373', label: listing.category }
  const Icon = catInfo.icon

  const favMutation = useMutation({
    mutationFn: () => listingsApi.toggleFavorite(listing.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  })

  return (
    <div className="card-hover group cursor-pointer flex flex-col h-full">
      {/* Cover */}
      <div className="relative h-36 bg-dark-800 overflow-hidden">
        {listing.cover_image ? (
          <img
            src={listing.cover_image}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${catInfo.color}10` }}
          >
            <Icon className="w-10 h-10 opacity-30" style={{ color: catInfo.color }} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span
            className="badge text-xs"
            style={{ background: `${catInfo.color}20`, color: catInfo.color, borderColor: `${catInfo.color}30` }}
          >
            <Icon className="w-3 h-3" />
            {catInfo.label}
          </span>
          {listing.verified && (
            <span className="badge-gold">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Save */}
        <button
          onClick={(e) => { e.preventDefault(); favMutation.mutate() }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-dark-400 hover:text-gold-400 transition-colors"
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <Link to={`/listing/${listing.id}`} className="flex flex-col flex-1 p-4 gap-3">
        {/* Owner */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-dark-700 overflow-hidden flex-shrink-0">
            {listing.owner.photo_url && (
              <img src={listing.owner.photo_url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <span className="text-xs text-dark-400 truncate">
            {listing.owner.first_name} {listing.owner.last_name}
          </span>
        </div>

        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-gold-300 transition-colors">
          {listing.title}
        </h3>

        {/* Stats row */}
        {(listing.subscriber_count || listing.avg_views) && (
          <div className="flex items-center gap-3 text-xs text-dark-400">
            {listing.subscriber_count && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatNumber(listing.subscriber_count)}
              </span>
            )}
            {listing.avg_views && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(listing.avg_views)}
              </span>
            )}
            {listing.engagement_rate && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {listing.engagement_rate.toFixed(1)}%
              </span>
            )}
            {listing.city && (
              <span className="flex items-center gap-1 ml-auto">
                <MapPin className="w-3 h-3" />
                {listing.city}
              </span>
            )}
          </div>
        )}

        {/* Price & Rating */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dark-800">
          <div>
            {listing.pricing_type === 'fixed' && listing.price_from ? (
              <span className="text-gold-400 font-semibold text-sm">
                {formatPrice(listing.price_from)} so'm
              </span>
            ) : listing.pricing_type === 'negotiable' ? (
              <span className="text-dark-400 text-xs">Kelishiladi</span>
            ) : (
              <span className="text-dark-400 text-xs">Taklif asosida</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
            <span className="text-xs text-dark-300">
              {listing.rating.toFixed(1)}
            </span>
            {listing.review_count > 0 && (
              <span className="text-xs text-dark-500">({listing.review_count})</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="card">
      <div className="h-36 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-24 shimmer rounded" />
        <div className="h-4 w-full shimmer rounded" />
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="h-3 w-1/2 shimmer rounded" />
      </div>
    </div>
  )
}
