import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, Handshake, BadgeCheck, User, MapPin,
  Link as LinkIcon, ChatCircle, Warning
} from '@phosphor-icons/react'
import { usersApi, listingsApi, chatApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Reklama xaridor', audience_owner: 'Reklama joyi egasi',
  marketing_operator: 'Marketing operator', creative_provider: 'Kreativ provider',
  provider: "E'lon egasi", marketing: 'Marketing', creative: 'Kreativ',
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user: me } = useAuthStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => usersApi.getProfile(Number(id)).then(r => r.data),
    enabled: !!id,
  })

  const { data: listings } = useQuery({
    queryKey: ['user-listings', id],
    queryFn: () => listingsApi.list({ per_page: 6 }).then(r => r.data),
    enabled: !!id,
  })

  const contactMut = useMutation({
    mutationFn: () => chatApi.startConversation(Number(id)),
    onSuccess: res => navigate(`/messages?conv=${res.data.id}`),
    onError: () => toast.error('Xatolik'),
  })

  const handleContact = () => {
    if (!isAuthenticated) { toast.error('Kirish talab etiladi'); return }
    contactMut.mutate()
  }

  if (isLoading) return (
    <div className="min-h-screen bg-obs-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-obs-900 flex flex-col items-center justify-center text-center px-6">
      <Warning size={48} color="#334155" weight="duotone" />
      <p className="text-obs-300 mt-3">Profil topilmadi</p>
      <button onClick={() => navigate(-1)} className="btn-primary mt-4">Orqaga</button>
    </div>
  )

  const u = profile.user
  const isMe = me?.id === u.id

  return (
    <div className="min-h-screen bg-obs-900 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <h1 className="flex-1 text-white font-semibold text-sm truncate">Profil</h1>
      </div>

      {/* Banner gradient */}
      <div className="h-24" style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(200,168,75,0.08))' }} />

      <div className="px-4">
        {/* Avatar */}
        <div className="flex items-end gap-4 -mt-10 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl border-4 border-obs-900 overflow-hidden">
              {u.photo_url
                ? <img src={u.photo_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-obs-800 flex items-center justify-center">
                    <User size={32} color="#64748b" weight="bold" />
                  </div>}
            </div>
            {u.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#c8a84b' }}>
                <BadgeCheck size={14} color="#060809" weight="fill" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-white font-bold text-lg truncate">{u.first_name} {u.last_name || ''}</h2>
            {u.telegram_username && <p className="text-obs-300 text-sm">@{u.telegram_username}</p>}
          </div>
        </div>

        {/* Role badge */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(13,148,136,0.12)', color: '#2dd4bf', border: '1px solid rgba(13,148,136,0.2)' }}>
            {ROLE_LABELS[profile.role] || profile.role}
          </span>
          {profile.verified_badge && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(200,168,75,0.1)', color: '#c8a84b', border: '1px solid rgba(200,168,75,0.2)' }}>
              <BadgeCheck size={10} weight="fill" /> Verified
            </span>
          )}
        </div>

        {/* Bio */}
        {profile.bio && <p className="text-obs-200 text-sm leading-relaxed mb-4">{profile.bio}</p>}

        {/* Location + website */}
        <div className="flex flex-col gap-1.5 mb-4">
          {profile.city && (
            <div className="flex items-center gap-2 text-obs-300 text-xs">
              <MapPin size={13} weight="bold" color="#64748b" /> {profile.city}
            </div>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-teal-400 text-xs">
              <LinkIcon size={13} weight="bold" /> {profile.website}
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { val: profile.rating > 0 ? profile.rating.toFixed(1) : '—', label: 'Reyting', color: '#c8a84b' },
            { val: profile.review_count, label: 'Sharh', color: '#2dd4bf' },
            { val: profile.completed_deals, label: 'Bitim', color: '#0d9488' },
            { val: `${profile.response_rate}%`, label: 'Javob', color: '#c8a84b' },
          ].map(({ val, label, color }) => (
            <div key={label} className="bg-obs-800 border border-obs-700 rounded-xl p-2 text-center">
              <div className="font-bold text-sm" style={{ color }}>{val}</div>
              <div className="text-[10px] text-obs-400 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        {listings && listings.items.length > 0 && (
          <div className="mb-4">
            <p className="text-obs-400 text-xs font-bold uppercase tracking-widest mb-3">E'lonlar</p>
            <div className="grid grid-cols-2 gap-2">
              {listings.items.slice(0, 4).map(l => (
                <Link key={l.id} to={`/listing/${l.id}`}>
                  <div className="bg-obs-800 border border-obs-700 rounded-xl p-3 active:scale-95 transition-all">
                    <div className="text-white text-xs font-semibold truncate mb-1">{l.title}</div>
                    <div className="font-bold text-[11px]" style={{ color: '#c8a84b' }}>
                      {l.price_from ? formatPrice(l.price_from) + " so'm" : 'Kelishiladi'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      {!isMe && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe pt-3 border-t border-obs-700" style={{ background: '#060809' }}>
          <button onClick={handleContact} disabled={contactMut.isPending}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            {contactMut.isPending
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><ChatCircle size={18} weight="bold" /> Muloqot boshlash</>}
          </button>
        </div>
      )}
    </div>
  )
}
