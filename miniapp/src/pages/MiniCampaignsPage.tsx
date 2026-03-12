import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Target, ChevronRight, Megaphone,
  Calendar, Users, DollarSign, Paintbrush
} from 'lucide-react'
import { campaignsApi, Campaign } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PLATFORMS = [
  { v: 'telegram', l: 'Telegram' },
  { v: 'instagram', l: 'Instagram' },
  { v: 'youtube', l: 'YouTube' },
  { v: 'tiktok', l: 'TikTok' },
  { v: 'billboard', l: 'Billboard' },
  { v: 'led', l: 'LED' },
]

function CampaignCard({ c }: { c: Campaign }) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
          <Target className="w-4 h-4 text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-[10px] font-medium border',
              c.status === 'open'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-dark-700 text-dark-400 border-dark-700'
            )}>
              {c.status === 'open' ? '🟢 Ochiq' : c.status}
            </span>
            {c.needs_creative && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Paintbrush className="w-2.5 h-2.5 inline mr-0.5" />Kreativ
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm truncate">{c.title}</h3>
        </div>
      </div>

      {c.description && (
        <p className="text-dark-400 text-xs mb-3 line-clamp-2 leading-relaxed">{c.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        {c.budget_min && (
          <div className="flex items-center gap-1.5 text-xs text-dark-400">
            <DollarSign className="w-3 h-3 text-gold-500" />
            {formatPrice(c.budget_min, c.currency)}
            {c.budget_max && ` – ${formatPrice(c.budget_max, c.currency)}`}
          </div>
        )}
        {c.duration_days && (
          <div className="flex items-center gap-1.5 text-xs text-dark-400">
            <Calendar className="w-3 h-3 text-blue-400" />
            {c.duration_days} kun
          </div>
        )}
        {c.city && (
          <div className="flex items-center gap-1.5 text-xs text-dark-400">
            <span className="text-[10px]">📍</span>{c.city}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-dark-400">
          <Users className="w-3 h-3 text-green-400" />
          {c.proposal_count} taklif
        </div>
      </div>

      {c.target_platforms.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.target_platforms.map((p) => (
            <span key={p} className="px-2 py-0.5 bg-dark-800 rounded-md text-[10px] text-dark-400">
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal: '',
    city: '',
    budget_min: '',
    budget_max: '',
    duration_days: '',
    target_platforms: [] as string[],
    needs_creative: false,
    needs_management: false,
  })

  const mutation = useMutation({
    mutationFn: () => campaignsApi.create({
      ...form,
      budget_min: form.budget_min ? Number(form.budget_min) : undefined,
      budget_max: form.budget_max ? Number(form.budget_max) : undefined,
      duration_days: form.duration_days ? Number(form.duration_days) : undefined,
      currency: 'UZS',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      qc.invalidateQueries({ queryKey: ['campaigns-home'] })
      toast.success('Kampaniya yaratildi!')
      onClose()
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  const togglePlatform = (v: string) => {
    setForm((f) => ({
      ...f,
      target_platforms: f.target_platforms.includes(v)
        ? f.target_platforms.filter((p) => p !== v)
        : [...f.target_platforms, v],
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark-950/90 backdrop-blur-sm flex flex-col justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-dark-900 border-t border-dark-800 rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-dark-700 rounded-full" />
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-lg">Yangi kampaniya</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center">
              <X className="w-4 h-4 text-dark-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-dark-400 mb-1.5 block">Kampaniya nomi *</label>
              <input
                className="input w-full"
                placeholder="Masalan: Restoran ochilish kampaniyasi"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-dark-400 mb-1.5 block">Maqsad / tavsif</label>
              <textarea
                className="input w-full h-20 resize-none"
                placeholder="Kampaniya maqsadi, kutilgan natija..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block">Budjet (dan)</label>
                <input
                  className="input w-full"
                  type="number"
                  placeholder="500 000"
                  value={form.budget_min}
                  onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block">Budjet (gacha)</label>
                <input
                  className="input w-full"
                  type="number"
                  placeholder="2 000 000"
                  value={form.budget_max}
                  onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block">Davomiyligi (kun)</label>
                <input
                  className="input w-full"
                  type="number"
                  placeholder="30"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block">Shahar</label>
                <input
                  className="input w-full"
                  placeholder="Toshkent"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-dark-400 mb-2 block">Platformalar</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => togglePlatform(v)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      form.target_platforms.includes(v)
                        ? 'bg-gold-500 text-dark-950'
                        : 'bg-dark-800 text-dark-400'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setForm({ ...form, needs_creative: !form.needs_creative })}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all',
                  form.needs_creative
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-dark-800 border-dark-700 text-dark-400'
                )}
              >
                🎨 Kreativ kerak
              </button>
              <button
                onClick={() => setForm({ ...form, needs_management: !form.needs_management })}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all',
                  form.needs_management
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-dark-800 border-dark-700 text-dark-400'
                )}
              >
                📊 Boshqaruv kerak
              </button>
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={!form.title || mutation.isPending}
              className="btn-primary w-full"
            >
              {mutation.isPending ? (
                <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : 'Kampaniya yaratish'}
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
    queryFn: () => campaignsApi.list({ status: 'open', per_page: 20 }).then((r) => r.data),
  })

  const { data: myCampaigns } = useQuery({
    queryKey: ['campaigns', 'mine'],
    queryFn: () => campaignsApi.mine(),
    enabled: isAuthenticated && tab === 'mine',
  })

  const handleCreate = () => {
    if (!isAuthenticated) {
      toast.error('Kampaniya yaratish uchun kirish kerak', { icon: '🔒' })
      return
    }
    setShowCreate(true)
  }

  const campaigns = tab === 'mine' ? (myCampaigns?.data || []) : (allCampaigns?.items || [])

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-lg">Kampaniyalar</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-2 bg-gold-500 rounded-xl text-dark-950 text-xs font-bold active:bg-gold-400 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Yangi
          </button>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2">
            {(['all', 'mine'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  tab === t ? 'bg-gold-500 text-dark-950' : 'bg-dark-800 text-dark-400'
                )}
              >
                {t === 'all' ? 'Barcha' : 'Mening'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-dark-900 border border-dark-800 rounded-2xl shimmer" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="w-12 h-12 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400 text-sm mb-4">
              {tab === 'mine' ? "Hali kampaniya yaratmagansiz" : "Hali kampaniyalar yo'q"}
            </p>
            <button onClick={handleCreate} className="btn-primary">
              Kampaniya yaratish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
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
