import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Plus, X, Target, CaretRight, Megaphone,
  Calendar, Users, CurrencyDollar, PaintBrush
} from '@phosphor-icons/react'
import { campaignsApi, Campaign } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PLATFORMS = [
  { v: 'telegram', l: 'Telegram' }, { v: 'instagram', l: 'Instagram' },
  { v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' },
  { v: 'billboard', l: 'Billboard' }, { v: 'led', l: 'LED' },
]

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

function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: '', description: '', goal: '', city: '',
    budget_min: '', budget_max: '', duration_days: '',
    target_platforms: [] as string[],
    needs_creative: false, needs_management: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Kampaniya nomi majburiy"
    else if (form.title.trim().length < 3) e.title = "Nom kamida 3 ta harf bo'lsin"
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length === 0) mutation.mutate()
  }

  const mutation = useMutation({
    mutationFn: () => {
      // Backend kutgan fieldlar aniq yuboriladi
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        target_platforms: form.target_platforms,
        needs_creative: form.needs_creative,
        needs_management: form.needs_management,
        currency: 'UZS',
      }
      if (form.description.trim()) payload.description = form.description.trim()
      if (form.city.trim()) payload.city = form.city.trim()
      if (form.budget_min) payload.budget_min = Number(form.budget_min)
      if (form.budget_max) payload.budget_max = Number(form.budget_max)
      if (form.duration_days) payload.duration_days = Number(form.duration_days)
      return campaignsApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      qc.invalidateQueries({ queryKey: ['campaigns-home'] })
      toast.success("Kampaniya muvaffaqiyatli yaratildi!")
      onClose()
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: unknown }; status?: number } }
      const msg = err?.response?.data?.detail
      const status = err?.response?.status
      if (Array.isArray(msg)) {
        const details = (msg as Record<string,unknown>[])
          .map(m => {
            const loc = Array.isArray(m.loc) ? (m.loc as string[]).slice(1).join('.') : ''
            return loc ? `${loc}: ${m.msg}` : String(m.msg)
          }).join(' | ')
        toast.error(details, { duration: 6000 })
        console.error('Validation errors:', msg)
      } else {
        toast.error(`${status ?? ''} ${String(msg || 'Server xatosi')}`, { duration: 5000 })
      }
    },
  })

  const togglePlatform = (v: string) =>
    setForm(f => ({ ...f, target_platforms: f.target_platforms.includes(v) ? f.target_platforms.filter(p => p !== v) : [...f.target_platforms, v] }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(6,8,9,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
        className="border-t border-obs-700 rounded-t-3xl max-h-[92vh] overflow-y-auto" style={{ background: '#0f1419' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-obs-600 rounded-full" />
        </div>
        <div className="px-4 pb-28">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-lg">Yangi kampaniya</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center">
              <X size={16} color="#64748b" weight="bold" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block"
                style={{color: errors.title ? '#ef4444' : '#94a3b8'}}>
                Kampaniya nomi <span style={{color:'#ef4444'}}>*</span>
              </label>
              <input
                className="input"
                style={errors.title ? {borderColor:'#ef4444'} : {}}
                placeholder="Masalan: Restoran ochilish kampaniyasi"
                value={form.title}
                onChange={e => {
                  setForm({ ...form, title: e.target.value })
                  if (errors.title) setErrors(p => ({ ...p, title: '' }))
                }} />
              {errors.title && <p className="text-xs mt-1" style={{color:'#ef4444'}}>{errors.title}</p>}
            </div>
            <div>
              <label className="text-xs text-obs-300 font-medium mb-1.5 block">Maqsad / tavsif</label>
              <textarea className="input h-20 resize-none"
                placeholder="Kampaniya maqsadi, kutilgan natija..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Budjet (dan)</label>
                <input className="input" type="number" placeholder="500 000"
                  value={form.budget_min} onChange={e => setForm({ ...form, budget_min: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Budjet (gacha)</label>
                <input className="input" type="number" placeholder="2 000 000"
                  value={form.budget_max} onChange={e => setForm({ ...form, budget_max: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Davomiyligi (kun)</label>
                <input className="input" type="number" placeholder="30"
                  value={form.duration_days} onChange={e => setForm({ ...form, duration_days: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Shahar</label>
                <input className="input" placeholder="Toshkent"
                  value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-obs-300 font-medium mb-2 block">Platformalar</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(({ v, l }) => (
                  <button key={v} onClick={() => togglePlatform(v)}
                    className={clsx('px-3 py-1.5 rounded-xl text-xs font-bold transition-all', form.target_platforms.includes(v) ? 'text-white' : 'bg-obs-800 text-obs-300 border border-obs-700')}
                    style={form.target_platforms.includes(v) ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : {}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setForm({ ...form, needs_creative: !form.needs_creative })}
                className={clsx('flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
                  form.needs_creative ? 'text-gold-500' : 'bg-obs-800 border-obs-700 text-obs-400')}
                style={form.needs_creative ? { background: 'rgba(200,168,75,0.1)', borderColor: 'rgba(200,168,75,0.3)' } : {}}>
                <PaintBrush size={12} weight="bold" /> Kreativ kerak
              </button>
              <button onClick={() => setForm({ ...form, needs_management: !form.needs_management })}
                className={clsx('flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
                  form.needs_management ? 'text-teal-400' : 'bg-obs-800 border-obs-700 text-obs-400')}
                style={form.needs_management ? { background: 'rgba(13,148,136,0.1)', borderColor: 'rgba(13,148,136,0.3)' } : {}}>
                <Target size={12} weight="bold" /> Boshqaruv kerak
              </button>
            </div>
            <button onClick={handleSubmit} disabled={mutation.isPending}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center transition-all"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
              {mutation.isPending
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Kampaniya yaratish'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MiniCampaignsPage() {
  const [showCreate, setShowCreate] = useState(false)
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
    setShowCreate(true)
  }

  const campaigns = tab === 'mine' ? (myCampaigns?.data || []) : (allCampaigns?.items || [])

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
            {campaigns.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <CampaignCard c={c} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  )
}
