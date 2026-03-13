import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Target, CaretRight, Megaphone,
  Calendar, Users, CurrencyDollar, PaintBrush
} from '@phosphor-icons/react'
import { campaignsApi, Campaign } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function CampaignCard({ c }: { c: Campaign }) {
  return (
    <Link to={`/campaign/${c.id}`}>
      <div className="bg-obs-800 border border-obs-700 rounded-2xl p-4 active:scale-[0.98] transition-all">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(13,148,136,0.12)' }}>
            <Target size={18} color="#2dd4bf" weight="duotone" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-[10px] font-bold',
                c.status === 'open'
                  ? 'text-teal-400' : 'text-obs-400'
              )}
                style={c.status === 'open'
                  ? { background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.2)' }
                  : { background: '#1a2530' }}>
                {c.status === 'open' ? '● Ochiq' : c.status}
              </span>
              {c.needs_creative && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5"
                  style={{ background: 'rgba(200,168,75,0.1)', color: '#c8a84b', border: '1px solid rgba(200,168,75,0.2)' }}>
                  <PaintBrush size={8} weight="bold" /> Kreativ
                </span>
              )}
            </div>
            <h3 className="text-white font-semibold text-sm truncate">{c.title}</h3>
          </div>
          <CaretRight size={14} color="#334155" weight="bold" />
        </div>

        {c.description && <p className="text-obs-300 text-xs mb-3 line-clamp-2 leading-relaxed">{c.description}</p>}

        <div className="grid grid-cols-2 gap-2">
          {c.budget_min && (
            <div className="flex items-center gap-1.5 text-xs text-obs-300">
              <CurrencyDollar size={12} color="#c8a84b" weight="bold" />
              <span className="truncate">{formatPrice(c.budget_min)}{c.budget_max ? ` — ${formatPrice(c.budget_max)}` : ''} so'm</span>
            </div>
          )}
          {c.duration_days && (
            <div className="flex items-center gap-1.5 text-xs text-obs-300">
              <Calendar size={12} color="#2dd4bf" weight="bold" /> {c.duration_days} kun
            </div>
          )}
          {c.city && (
            <div className="flex items-center gap-1.5 text-xs text-obs-300 truncate">
              <span className="w-2 h-2 rounded-full bg-obs-500" />{c.city}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-obs-300">
            <Users size={12} color="#2dd4bf" weight="bold" /> {c.proposal_count} taklif
          </div>
        </div>

        {c.target_platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {c.target_platforms.map(p => (
              <span key={p} className="px-2 py-0.5 bg-obs-700 rounded-md text-[10px] text-obs-300 font-medium">{p}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}



export default function MiniCampaignsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const { isAuthenticated } = useAuthStore()

  const { data: allCampaigns, isLoading } = useQuery({
    queryKey: ['campaigns', 'all'],
    queryFn: () => campaignsApi.list({ per_page: 20 }).then(r => r.data),
  })

  const { data: myCampaigns } = useQuery({
    queryKey: ['campaigns', 'mine'],
    queryFn: () => campaignsApi.mine(),
    enabled: isAuthenticated && tab === 'mine',
  })

  const handleCreate = () => {
    if (!isAuthenticated) { toast.error('Kampaniya yaratish uchun kirish kerak'); return }
    navigate('/campaign/create')
  }

  const campaigns = tab === 'mine' ? (myCampaigns as any)?.data || [] : (allCampaigns?.items || [])

  return (
    <div className="min-h-screen bg-obs-900">
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-lg">Kampaniyalar</h1>
          <button onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <Plus size={14} weight="bold" /> Yangi
          </button>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2">
            {(['all', 'mine'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('px-4 py-1.5 rounded-xl text-xs font-bold transition-all', tab === t ? 'text-white' : 'bg-obs-800 text-obs-300')}
                style={tab === t ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : {}}>
                {t === 'all' ? 'Barcha' : 'Mening'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-36 bg-obs-800 rounded-2xl shimmer" />)}</div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-obs-800 flex items-center justify-center mb-4">
              <Megaphone size={32} color="#334155" weight="duotone" />
            </div>
            <p className="text-obs-300 font-medium">{tab === 'mine' ? "Hali kampaniya yaratmagansiz" : "Hali kampaniyalar yo'q"}</p>
            <button onClick={handleCreate} className="btn-primary mt-4 text-sm">Kampaniya yaratish</button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c: any, i: number) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <CampaignCard c={c} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
