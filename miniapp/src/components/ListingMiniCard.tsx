import { Link } from 'react-router-dom'
import { Star, Users, Eye, Send, TrendingUp, Monitor, MapPin, BadgeCheck } from 'lucide-react'
import { Listing } from '../utils/api'
import { formatNumber, formatPrice } from '../utils/format'

const CAT_META: Record<string, { icon: typeof Send; color: string; label: string }> = {
  telegram_channel: { icon: Send, color: '#29b6f6', label: 'Telegram' },
  youtube_creator: { icon: TrendingUp, color: '#ef4444', label: 'YouTube' },
  billboard: { icon: MapPin, color: '#a78bfa', label: 'Billboard' },
  led_screen: { icon: Monitor, color: '#a78bfa', label: 'LED' },
  media_buyer: { icon: TrendingUp, color: '#f59e0b', label: 'Media Buyer' },
  graphic_designer: { icon: Users, color: '#fb923c', label: 'Dizayner' },
  smm: { icon: Users, color: '#34d399', label: 'SMM' },
}

export function ListingMiniCard({ listing }: { listing: Listing }) {
  const meta = CAT_META[listing.category] || { icon: Send, color: '#737373', label: listing.category }
  const Icon = meta.icon

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="block bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden active:scale-95 transition-all"
    >
      {/* Cover */}
      <div className="h-28 relative" style={{ background: `${meta.color}10` }}>
        {listing.cover_image ? (
          <img src={listing.cover_image} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-8 h-8 opacity-25" style={{ color: meta.color }} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
            style={{ background: `${meta.color}20`, color: meta.color, borderColor: `${meta.color}30` }}
          >
            <Icon className="w-2.5 h-2.5" />
            {meta.label}
          </span>
        </div>
        {listing.verified && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500/90 rounded-full flex items-center justify-center">
            <BadgeCheck className="w-3 h-3 text-dark-950" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <h3 className="text-white text-xs font-semibold line-clamp-2 leading-snug mb-2">
          {listing.title}
        </h3>

        <div className="flex items-center gap-2 text-[10px] text-dark-500 mb-2">
          {listing.subscriber_count && (
            <span className="flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" />
              {formatNumber(listing.subscriber_count)}
            </span>
          )}
          {listing.avg_views && (
            <span className="flex items-center gap-0.5">
              <Eye className="w-2.5 h-2.5" />
              {formatNumber(listing.avg_views)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-gold-400 text-xs font-semibold">
            {listing.price_from
              ? `${formatPrice(listing.price_from)} so'm`
              : 'Kelishiladi'}
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-gold-400 fill-gold-400" />
            <span className="text-[10px] text-dark-400">{listing.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
