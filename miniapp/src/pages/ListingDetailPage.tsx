import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Heart, ShareNetwork, CheckCircle,
  TelegramLogo, Star, Users, Eye, MapPin,
  ChartLineUp, ChatCircle, PaperPlaneTilt, Warning
} from '@phosphor-icons/react'
import { listingsApi, chatApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice, formatNumber } from '../utils/format'
import { useState } from 'react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CATEGORY_LABELS: Record<string, string> = {
  telegram_channel: 'Telegram kanal', youtube_creator: 'YouTube', instagram: 'Instagram',
  tiktok: 'TikTok', billboard: 'Billboard', led_screen: 'LED ekran',
  transport: 'Transport', media_buyer: 'Media Buyer', targetologist: 'Targetolog',
  smm: 'SMM', marketing_agency: 'Agentlik', graphic_designer: 'Grafik dizayner',
  video_maker: 'Video maker', copywriter: 'Copywriter', motion_designer: 'Motion dizayner',
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [saved, setSaved] = useState(false)

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.get(Number(id)).then(r => r.data),
    enabled: !!id,
  })

  const contactMutation = useMutation({
    mutationFn: () => chatApi.startConversation(listing!.owner.id, listing!.id),
    onSuccess: (res) => {
      navigate(`/messages?conv=${res.data.id}`)
    },
    onError: () => toast.error('Chat ochishda xatolik'),
  })

  const handleContact = () => {
    if (!isAuthenticated) { toast.error('Kirish talab etiladi'); return }
    contactMutation.mutate()
  }

  const handleProposal = () => {
    if (!isAuthenticated) { toast.error('Kirish talab etiladi'); return }
    navigate(`/proposal/listing/${id}`)
  }

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Kirish talab etiladi'); return }
    try {
      await listingsApi.toggleFavorite(Number(id))
      setSaved(s => !s)
      toast.success(saved ? "Saqlanganlardan olib tashlandi" : "Saqlandi!")
    } catch { toast.error('Xatolik') }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-obs-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-obs-900 flex flex-col items-center justify-center px-6 text-center">
      <Warning size={48} color="#334155" weight="duotone" />
      <p className="text-obs-300 mt-3">E'lon topilmadi</p>
      <button onClick={() => navigate('/explore')} className="btn-primary mt-4">Orqaga</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-obs-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm truncate">{listing.title}</h1>
          <p className="text-obs-300 text-[10px]">{CATEGORY_LABELS[listing.category] || listing.category}</p>
        </div>
        <button onClick={handleSave}
          className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <Heart size={18} color={saved ? '#c8a84b' : '#64748b'} weight={saved ? 'fill' : 'regular'} />
        </button>
        <button className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ShareNetwork size={18} color="#64748b" weight="bold" />
        </button>
      </div>

      {/* Cover */}
      {listing.cover_image ? (
        <img src={listing.cover_image} alt="" className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(200,168,75,0.08))' }}>
          <div className="text-center">
            <TelegramLogo size={40} color="#0d9488" weight="duotone" />
            <p className="text-obs-300 text-xs mt-2">{CATEGORY_LABELS[listing.category]}</p>
          </div>
        </div>
      )}

      <div className="px-4 pt-4">

        {/* Title + badges */}
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(13,148,136,0.12)', color: '#2dd4bf', border: '1px solid rgba(13,148,136,0.2)' }}>
              {CATEGORY_LABELS[listing.category]}
            </span>
            {listing.verified && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(200,168,75,0.1)', color: '#c8a84b', border: '1px solid rgba(200,168,75,0.2)' }}>
                <CheckCircle size={10} weight="fill" /> Verified
              </span>
            )}
            {listing.featured && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(200,168,75,0.1)', color: '#c8a84b' }}>
                ✦ Featured
              </span>
            )}
          </div>
          <h2 className="text-white font-bold text-lg leading-tight mb-1">{listing.title}</h2>
          {listing.city && (
            <div className="flex items-center gap-1 text-obs-300 text-xs">
              <MapPin size={12} weight="bold" /> {listing.city}
            </div>
          )}
        </div>

        {/* Rating */}
        {listing.review_count > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-obs-800 border border-obs-700 rounded-2xl">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} color={i < Math.round(listing.rating) ? '#c8a84b' : '#1a2530'} weight="fill" />
              ))}
            </div>
            <span className="text-white font-bold text-sm">{listing.rating.toFixed(1)}</span>
            <span className="text-obs-300 text-xs">{listing.review_count} sharh</span>
            <span className="text-obs-300 text-xs ml-auto">{listing.view_count} ko'rish</span>
          </div>
        )}

        {/* Stats */}
        {(listing.subscriber_count || listing.avg_views || listing.engagement_rate || listing.daily_traffic) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {listing.subscriber_count && (
              <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.12)' }}>
                  <Users size={16} color="#2dd4bf" weight="bold" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{formatNumber(listing.subscriber_count)}</div>
                  <div className="text-obs-300 text-[10px]">Obunachi</div>
                </div>
              </div>
            )}
            {listing.avg_views && (
              <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.1)' }}>
                  <Eye size={16} color="#c8a84b" weight="bold" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{formatNumber(listing.avg_views)}</div>
                  <div className="text-obs-300 text-[10px]">O'rtacha ko'rish</div>
                </div>
              </div>
            )}
            {listing.engagement_rate && (
              <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.12)' }}>
                  <ChartLineUp size={16} color="#2dd4bf" weight="bold" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{listing.engagement_rate}%</div>
                  <div className="text-obs-300 text-[10px]">Engagement</div>
                </div>
              </div>
            )}
            {listing.daily_traffic && (
              <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.1)' }}>
                  <Eye size={16} color="#c8a84b" weight="bold" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{formatNumber(listing.daily_traffic)}</div>
                  <div className="text-obs-300 text-[10px]">Kunlik o'tuvchi</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="bg-obs-800 border border-obs-700 rounded-2xl p-4 mb-4">
          <p className="text-obs-300 text-xs font-medium mb-1">Narx</p>
          <div className="text-gold-500 font-bold text-xl">
            {listing.pricing_type === 'negotiable'
              ? 'Kelishiladi'
              : listing.pricing_type === 'proposal'
              ? 'Taklif asosida'
              : listing.price_from
              ? `${formatPrice(listing.price_from)} ${listing.currency}${listing.price_to ? ` — ${formatPrice(listing.price_to)}` : ''}`
              : 'Kelishiladi'}
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mb-4">
            <p className="text-obs-300 text-xs font-medium mb-2">Tavsif</p>
            <p className="text-obs-100 text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Ad formats */}
        {listing.ad_formats?.length > 0 && (
          <div className="mb-4">
            <p className="text-obs-300 text-xs font-medium mb-2">Reklama formatlari</p>
            <div className="flex flex-wrap gap-2">
              {listing.ad_formats.map(f => (
                <span key={f} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-obs-800 border border-obs-700 text-obs-200">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Channel link */}
        {listing.telegram_channel_url && (
          <div className="mb-4">
            <a href={listing.telegram_channel_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-obs-800 border border-obs-700 rounded-2xl active:scale-98">
              <TelegramLogo size={20} color="#2dd4bf" weight="fill" />
              <span className="text-teal-400 text-sm font-medium truncate">{listing.telegram_channel_url}</span>
            </a>
          </div>
        )}

        {/* Owner */}
        <div className="mb-4">
          <p className="text-obs-300 text-xs font-medium mb-2">E'lon egasi</p>
          <button onClick={() => navigate(`/user/${listing.owner.id}`)}
            className="w-full flex items-center gap-3 p-3 bg-obs-800 border border-obs-700 rounded-2xl active:scale-98 transition-all">
            {listing.owner.photo_url
              ? <img src={listing.owner.photo_url} alt="" className="w-10 h-10 rounded-2xl object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-2xl bg-obs-700 flex items-center justify-center flex-shrink-0">
                  <Users size={18} color="#64748b" weight="bold" />
                </div>}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">
                {listing.owner.first_name} {listing.owner.last_name || ''}
              </div>
              {listing.owner.telegram_username && (
                <div className="text-obs-300 text-xs">@{listing.owner.telegram_username}</div>
              )}
            </div>
            <ChartLineUp size={16} color="#334155" weight="bold" />
          </button>
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe pt-3 border-t border-obs-700" style={{ background: '#060809' }}>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleContact} disabled={contactMutation.isPending}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white border border-obs-600 bg-obs-800 active:scale-95 transition-all">
            {contactMutation.isPending
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><ChatCircle size={18} weight="bold" /> Aloqa</>}
          </button>
          <button onClick={handleProposal}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <PaperPlaneTilt size={18} weight="bold" /> Taklif yuborish
          </button>
        </div>
      </div>
    </div>
  )
}
