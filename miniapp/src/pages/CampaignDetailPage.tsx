import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Target, Calendar, Users, CurrencyDollar,
  MapPin, PaintBrush, PaperPlaneTilt, Warning, CheckCircle
} from '@phosphor-icons/react'
import { campaignsApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:      { label: 'Ochiq', color: '#2dd4bf', bg: 'rgba(13,148,136,0.12)' },
  closed:    { label: 'Yopiq', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  completed: { label: 'Tugadi', color: '#0d9488', bg: 'rgba(13,148,136,0.15)' },
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.get(Number(id)).then(r => r.data),
    enabled: !!id,
  })

  const handleProposal = () => {
    if (!isAuthenticated) { toast.error('Kirish talab etiladi'); return }
    navigate(`/proposal/campaign/${id}`)
  }

  if (isLoading) return (
    <div className="min-h-screen bg-obs-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!campaign) return (
    <div className="min-h-screen bg-obs-900 flex flex-col items-center justify-center px-6 text-center">
      <Warning size={48} color="#334155" weight="duotone" />
      <p className="text-obs-300 mt-3">Kampaniya topilmadi</p>
      <button onClick={() => navigate('/campaigns')} className="btn-primary mt-4">Orqaga</button>
    </div>
  )

  const statusCfg = STATUS_LABELS[campaign.status] || STATUS_LABELS.open
  const isOwner = user?.id === campaign.buyer.id

  return (
    <div className="min-h-screen bg-obs-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm truncate">Kampaniya tafsiloti</h1>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: statusCfg.bg, color: statusCfg.color }}>
          {statusCfg.label}
        </span>
      </div>

      {/* Banner */}
      <div className="w-full h-32 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(200,168,75,0.06))' }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.2)' }}>
            <Target size={28} color="#2dd4bf" weight="duotone" />
          </div>
          <span className="text-obs-300 text-xs font-medium">Reklama kampaniyasi</span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Title */}
        <h2 className="text-white font-bold text-xl mb-1 leading-tight">{campaign.title}</h2>
        {campaign.city && (
          <div className="flex items-center gap-1 text-obs-300 text-xs mb-4">
            <MapPin size={12} weight="bold" /> {campaign.city}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {campaign.budget_min && (
            <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.1)' }}>
                <CurrencyDollar size={16} color="#c8a84b" weight="bold" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">
                  {formatPrice(campaign.budget_min)}{campaign.budget_max ? `–${formatPrice(campaign.budget_max)}` : ''} UZS
                </div>
                <div className="text-obs-300 text-[10px]">Budjet</div>
              </div>
            </div>
          )}
          {campaign.duration_days && (
            <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.12)' }}>
                <Calendar size={16} color="#2dd4bf" weight="bold" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{campaign.duration_days} kun</div>
                <div className="text-obs-300 text-[10px]">Davomiyligi</div>
              </div>
            </div>
          )}
          <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.12)' }}>
              <Users size={16} color="#2dd4bf" weight="bold" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{campaign.proposal_count}</div>
              <div className="text-obs-300 text-[10px]">Taklif</div>
            </div>
          </div>
          {campaign.deadline && (
            <div className="bg-obs-800 border border-obs-700 rounded-2xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.1)' }}>
                <Calendar size={16} color="#c8a84b" weight="bold" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{formatDate(campaign.deadline)}</div>
                <div className="text-obs-300 text-[10px]">Muddat</div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {campaign.description && (
          <div className="mb-4">
            <p className="text-obs-300 text-xs font-medium mb-2">Tavsif</p>
            <p className="text-obs-100 text-sm leading-relaxed">{campaign.description}</p>
          </div>
        )}

        {/* Target audience */}
        {campaign.target_audience && (
          <div className="mb-4">
            <p className="text-obs-300 text-xs font-medium mb-2">Maqsadli auditoriya</p>
            <p className="text-obs-100 text-sm">{campaign.target_audience}</p>
          </div>
        )}

        {/* Platforms */}
        {campaign.target_platforms?.length > 0 && (
          <div className="mb-4">
            <p className="text-obs-300 text-xs font-medium mb-2">Platformalar</p>
            <div className="flex flex-wrap gap-2">
              {campaign.target_platforms.map(p => (
                <span key={p} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-obs-800 border border-obs-700 text-obs-200">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Extra needs */}
        {(campaign.needs_creative || campaign.needs_management) && (
          <div className="flex gap-2 mb-4">
            {campaign.needs_creative && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(200,168,75,0.1)', color: '#c8a84b', border: '1px solid rgba(200,168,75,0.2)' }}>
                <PaintBrush size={12} weight="bold" /> Kreativ kerak
              </span>
            )}
            {campaign.needs_management && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(13,148,136,0.1)', color: '#2dd4bf', border: '1px solid rgba(13,148,136,0.2)' }}>
                <Target size={12} weight="bold" /> Boshqaruv kerak
              </span>
            )}
          </div>
        )}

        {/* Owner */}
        <div className="mb-4">
          <p className="text-obs-300 text-xs font-medium mb-2">Kampaniya egasi</p>
          <button onClick={() => navigate(`/user/${campaign.buyer.id}`)}
            className="w-full flex items-center gap-3 p-3 bg-obs-800 border border-obs-700 rounded-2xl active:scale-98 transition-all">
            {campaign.buyer.photo_url
              ? <img src={campaign.buyer.photo_url} alt="" className="w-10 h-10 rounded-2xl object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-2xl bg-obs-700 flex items-center justify-center flex-shrink-0">
                  <Users size={18} color="#64748b" weight="bold" />
                </div>}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{campaign.buyer.first_name} {campaign.buyer.last_name || ''}</div>
              <div className="text-obs-300 text-xs">{formatDate(campaign.created_at)} da yaratildi</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom action */}
      {!isOwner && campaign.status === 'open' && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe pt-3 border-t border-obs-700" style={{ background: '#060809' }}>
          <button onClick={handleProposal}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <PaperPlaneTilt size={18} weight="bold" /> Taklif yuborish
          </button>
        </div>
      )}

      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe pt-3 border-t border-obs-700" style={{ background: '#060809' }}>
          <div className="flex items-center justify-center gap-2 py-3">
            <CheckCircle size={16} color="#0d9488" weight="fill" />
            <span className="text-obs-300 text-sm">Bu sizning kampaniyangiz</span>
          </div>
        </div>
      )}
    </div>
  )
}
