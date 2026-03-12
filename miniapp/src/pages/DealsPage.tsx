import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, Handshake, CheckCircle, Clock, XCircle, ChatCircle, Warning } from '@phosphor-icons/react'
import { dealsApi, Deal } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  pending:   { label: 'Kutilmoqda', color: '#c8a84b', bg: 'rgba(200,168,75,0.1)', icon: <Clock size={14} color="#c8a84b" weight="bold" /> },
  active:    { label: 'Jarayonda', color: '#2dd4bf', bg: 'rgba(13,148,136,0.12)', icon: <Handshake size={14} color="#2dd4bf" weight="bold" /> },
  completed: { label: 'Tugadi', color: '#0d9488', bg: 'rgba(13,148,136,0.15)', icon: <CheckCircle size={14} color="#0d9488" weight="fill" /> },
  cancelled: { label: 'Bekor', color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: <XCircle size={14} color="#64748b" weight="bold" /> },
}

function DealCard({ deal }: { deal: Deal }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const cfg = STATUS_CONFIG[deal.status] || STATUS_CONFIG.pending

  const updateDeal = useMutation({
    mutationFn: (status: string) => dealsApi.update(deal.id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] })
      toast.success('Bitim yangilandi')
    },
    onError: () => toast.error('Xatolik'),
  })

  const isBuyer = user?.id === deal.buyer.id

  return (
    <div className="bg-obs-800 border border-obs-700 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
          <Handshake size={20} color={cfg.color} weight="duotone" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{deal.title}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.icon}{cfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <p className="text-obs-400 mb-0.5">Narx</p>
          <p className="text-gold-500 font-bold">{formatPrice(deal.price)} {deal.currency}</p>
        </div>
        <div>
          <p className="text-obs-400 mb-0.5">Sana</p>
          <p className="text-obs-200">{formatDate(deal.created_at)}</p>
        </div>
        <div>
          <p className="text-obs-400 mb-0.5">{isBuyer ? 'Provider' : 'Xaridor'}</p>
          <p className="text-obs-200 truncate">{isBuyer ? deal.provider.first_name : deal.buyer.first_name}</p>
        </div>
        {deal.deadline && (
          <div>
            <p className="text-obs-400 mb-0.5">Muddat</p>
            <p className="text-obs-200">{formatDate(deal.deadline)}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => navigate('/messages')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-obs-600 text-obs-200 text-xs font-semibold active:scale-95 transition-all">
          <ChatCircle size={14} weight="bold" /> Chat
        </button>
        {deal.status === 'active' && (
          <button onClick={() => updateDeal.mutate('completed')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <CheckCircle size={14} weight="bold" /> Tugatish
          </button>
        )}
        {deal.status === 'pending' && isBuyer && (
          <button onClick={() => updateDeal.mutate('active')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <CheckCircle size={14} weight="bold" /> Qabul
          </button>
        )}
      </div>
    </div>
  )
}

export default function DealsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'active' | 'completed' | 'cancelled'>('active')

  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list().then(r => r.data),
  })

  const filtered = deals?.filter(d => {
    if (tab === 'active') return ['pending', 'active'].includes(d.status)
    if (tab === 'completed') return d.status === 'completed'
    return d.status === 'cancelled'
  }) || []

  return (
    <div className="min-h-screen bg-obs-900">
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
            <ArrowLeft size={18} color="#94a3b8" weight="bold" />
          </button>
          <h1 className="text-white font-bold text-base flex-1">Bitimlar</h1>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'active', label: 'Faol' },
            { key: 'completed', label: 'Tugagan' },
            { key: 'cancelled', label: 'Bekor' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={clsx('px-4 py-1.5 rounded-xl text-xs font-bold transition-all', tab === key ? 'text-white' : 'bg-obs-800 text-obs-300')}
              style={tab === key ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-40 bg-obs-800 rounded-2xl shimmer" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-obs-800 flex items-center justify-center mb-4">
              <Handshake size={32} color="#334155" weight="duotone" />
            </div>
            <p className="text-obs-300 font-medium">Bitimlar yo'q</p>
            <p className="text-obs-400 text-sm mt-1">Taklif yuborib kelishuv tuzing</p>
            <button onClick={() => navigate('/explore')} className="btn-primary mt-4 text-sm">
              E'lonlarni ko'rish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <DealCard deal={d} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
