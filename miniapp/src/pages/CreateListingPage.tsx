import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TelegramLogo, YoutubeLogo, InstagramLogo, Desktop, MapPin,
  ChartLineUp, Users, PaintBrush, Video, Pen,
  CaretLeft, CaretRight, CheckCircle, Lightning, X, CurrencyDollar
} from '@phosphor-icons/react'
import clsx from 'clsx'
import { listingsApi } from '../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  {
    group: "Ijtimoiy tarmoqlar",
    items: [
      { id: 'telegram_channel', icon: TelegramLogo, label: 'Telegram kanal', color: '#2dd4bf' },
      { id: 'youtube_creator', icon: YoutubeLogo, label: 'YouTube', color: '#ef4444' },
      { id: 'instagram', icon: InstagramLogo, label: 'Instagram', color: '#e1306c' },
      { id: 'tiktok', icon: Video, label: 'TikTok', color: '#00f2ea' },
    ]
  },
  {
    group: "Tashqi reklama",
    items: [
      { id: 'billboard', icon: MapPin, label: 'Billboard', color: '#a78bfa' },
      { id: 'led_screen', icon: Desktop, label: 'LED ekran', color: '#c8a84b' },
      { id: 'transport', icon: ChartLineUp, label: 'Transport', color: '#34d399' },
    ]
  },
  {
    group: "Marketing xizmatlar",
    items: [
      { id: 'media_buyer', icon: ChartLineUp, label: 'Media Buyer', color: '#c8a84b' },
      { id: 'targetologist', icon: ChartLineUp, label: 'Targetolog', color: '#fb923c' },
      { id: 'smm', icon: Users, label: 'SMM', color: '#34d399' },
      { id: 'marketing_agency', icon: Users, label: 'Agentlik', color: '#60a5fa' },
    ]
  },
  {
    group: "Kreativ xizmatlar",
    items: [
      { id: 'graphic_designer', icon: PaintBrush, label: 'Dizayner', color: '#a78bfa' },
      { id: 'video_maker', icon: Video, label: 'Video maker', color: '#f43f5e' },
      { id: 'copywriter', icon: Pen, label: 'Copywriter', color: '#22d3ee' },
      { id: 'motion_designer', icon: Lightning, label: 'Motion dizayner', color: '#c8a84b' },
    ]
  },
]

const AD_FORMATS = ['Post', 'Repost', 'Story', 'Reel', 'Banner', "Pre-roll", "Native"]
const PRICING_TYPES = [
  { id: 'fixed', label: 'Belgilangan' },
  { id: 'negotiable', label: 'Kelishiladi' },
  { id: 'proposal', label: 'Taklif asosida' },
]

type Form = {
  category: string
  title: string
  description: string
  city: string
  pricing_type: string
  price_from: string
  price_to: string
  currency: string
  telegram_channel_url: string
  subscriber_count: string
  avg_views: string
  engagement_rate: string
  ad_formats: string[]
  tags: string
}

const INIT: Form = {
  category: '', title: '', description: '', city: '',
  pricing_type: 'fixed', price_from: '', price_to: '', currency: 'UZS',
  telegram_channel_url: '', subscriber_count: '', avg_views: '', engagement_rate: '',
  ad_formats: [], tags: '',
}

export default function CreateListingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>(INIT)
  const [saving, setSaving] = useState(false)

  const STEPS = ["Kategoriya", "Asosiy", "Narx", "Qo'shimcha"]

  const isTelegram = form.category === 'telegram_channel'
  const isYoutube  = form.category === 'youtube_creator'
  const isSocial   = isTelegram || isYoutube || form.category === 'instagram' || form.category === 'tiktok'

  const toggleFormat = (f: string) =>
    setForm(p => ({ ...p, ad_formats: p.ad_formats.includes(f) ? p.ad_formats.filter(x => x !== f) : [...p.ad_formats, f] }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await listingsApi.create({
        ...form,
        subscriber_count: form.subscriber_count ? Number(form.subscriber_count) : undefined,
        avg_views: form.avg_views ? Number(form.avg_views) : undefined,
        engagement_rate: form.engagement_rate ? Number(form.engagement_rate) : undefined,
        price_from: form.price_from ? Number(form.price_from) : undefined,
        price_to: form.price_to ? Number(form.price_to) : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      })
      window.Telegram?.WebApp.HapticFeedback?.impactOccurred('medium')
      toast.success("E'lon yaratildi!")
      navigate('/profile')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      toast.error(err?.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const canNext = () => {
    if (step === 0) return !!form.category
    if (step === 1) return !!form.title.trim()
    return true
  }

  return (
    <div className="fixed inset-0 bg-obs-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-obs-700 glass flex-shrink-0">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <CaretLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm">E'lon yaratish</h1>
          <p className="text-obs-300 text-[10px]">{STEPS[step]}</p>
        </div>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <X size={16} color="#64748b" weight="bold" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1.5 px-4 py-3 border-b border-obs-700 flex-shrink-0">
        {STEPS.map((s, i) => (
          <div key={s} className={clsx('flex-1 h-1 rounded-full transition-all', i <= step ? '' : 'bg-obs-700')}
            style={i <= step ? { background: 'linear-gradient(90deg,#0d9488,#2dd4bf)' } : {}} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {/* Step 0 — Kategoriya */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {CATEGORIES.map(({ group, items }) => (
                <div key={group} className="mb-5">
                  <p className="text-obs-400 text-[10px] font-bold uppercase tracking-widest mb-2">{group}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map(({ id, icon: Icon, label, color }) => {
                      const sel = form.category === id
                      return (
                        <button key={id} onClick={() => setForm(f => ({ ...f, category: id }))}
                          className="flex items-center gap-3 p-3.5 rounded-2xl border text-left active:scale-[0.97] transition-all"
                          style={{ borderColor: sel ? 'rgba(13,148,136,0.5)' : '#1a2530', background: sel ? 'rgba(13,148,136,0.08)' : '#0f1419' }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                            <Icon size={18} style={{ color }} weight="bold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-white text-xs font-semibold truncate block">{label}</span>
                          </div>
                          {sel && <CheckCircle size={16} color="#0d9488" weight="fill" className="flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Step 1 — Asosiy */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4">
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Sarlavha *</label>
                <input className="input" placeholder="Masalan: Toshkent Yangiliklari kanali"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Tavsif</label>
                <textarea className="input h-24 resize-none"
                  placeholder="E'lon haqida batafsil ma'lumot..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Shahar</label>
                <div className="relative">
                  <MapPin size={16} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" weight="bold" />
                  <input className="input pl-9" placeholder="Toshkent"
                    value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              {isTelegram && (
                <div>
                  <label className="text-xs text-obs-300 font-medium mb-1.5 block">Kanal URL</label>
                  <div className="relative">
                    <TelegramLogo size={16} color="#2dd4bf" className="absolute left-3 top-1/2 -translate-y-1/2" weight="fill" />
                    <input className="input pl-9" placeholder="https://t.me/kanalingiz"
                      value={form.telegram_channel_url} onChange={e => setForm(f => ({ ...f, telegram_channel_url: e.target.value }))} />
                  </div>
                </div>
              )}
              {isSocial && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-obs-400 font-medium mb-1 block">Obunachi</label>
                    <input className="input py-2.5 text-sm" type="number" placeholder="120000"
                      value={form.subscriber_count} onChange={e => setForm(f => ({ ...f, subscriber_count: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] text-obs-400 font-medium mb-1 block">Avg views</label>
                    <input className="input py-2.5 text-sm" type="number" placeholder="15000"
                      value={form.avg_views} onChange={e => setForm(f => ({ ...f, avg_views: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] text-obs-400 font-medium mb-1 block">ER %</label>
                    <input className="input py-2.5 text-sm" type="number" placeholder="3.5"
                      value={form.engagement_rate} onChange={e => setForm(f => ({ ...f, engagement_rate: e.target.value }))} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2 — Narx */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4">
              <div>
                <label className="text-xs text-obs-300 font-medium mb-2 block">Narx turi</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICING_TYPES.map(({ id, label }) => (
                    <button key={id} onClick={() => setForm(f => ({ ...f, pricing_type: id }))}
                      className={clsx('py-2.5 rounded-xl text-xs font-bold border transition-all', form.pricing_type === id ? 'text-white' : 'bg-obs-800 border-obs-700 text-obs-300')}
                      style={form.pricing_type === id ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)', border: 'none' } : {}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.pricing_type === 'fixed' && (
                <>
                  <div>
                    <label className="text-xs text-obs-300 font-medium mb-1.5 block">Narx (dan) *</label>
                    <div className="relative">
                      <CurrencyDollar size={16} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" weight="bold" />
                      <input className="input pl-9" type="number" placeholder="500000"
                        value={form.price_from} onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-obs-300 font-medium mb-1.5 block">Narx (gacha)</label>
                    <div className="relative">
                      <CurrencyDollar size={16} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" weight="bold" />
                      <input className="input pl-9" type="number" placeholder="1500000"
                        value={form.price_to} onChange={e => setForm(f => ({ ...f, price_to: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}

              {form.pricing_type !== 'fixed' && (
                <div className="p-4 rounded-2xl border" style={{ background: 'rgba(13,148,136,0.06)', borderColor: 'rgba(13,148,136,0.15)' }}>
                  <p className="text-teal-400 text-xs leading-relaxed">
                    💡 Mijozlar siz bilan bevosita muloqot qilib narx bo'yicha kelishib olishadi.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Valyuta</label>
                <div className="flex gap-2">
                  {['UZS', 'USD'].map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, currency: c }))}
                      className={clsx('px-5 py-2.5 rounded-xl text-xs font-bold transition-all', form.currency === c ? 'text-white' : 'bg-obs-800 border border-obs-700 text-obs-300')}
                      style={form.currency === c ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : {}}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Qo'shimcha */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4">
              <div>
                <label className="text-xs text-obs-300 font-medium mb-2 block">Reklama formatlari</label>
                <div className="flex flex-wrap gap-2">
                  {AD_FORMATS.map(f => {
                    const sel = form.ad_formats.includes(f)
                    return (
                      <button key={f} onClick={() => toggleFormat(f)}
                        className={clsx('px-3 py-1.5 rounded-xl text-xs font-bold transition-all', sel ? 'text-white' : 'bg-obs-800 border border-obs-700 text-obs-300')}
                        style={sel ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : {}}>
                        {f}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Teglar (vergul bilan)</label>
                <input className="input" placeholder="reklama, kanal, marketing"
                  value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>

              {/* Summary */}
              <div className="p-4 bg-obs-800 border border-obs-700 rounded-2xl space-y-2">
                <p className="text-obs-300 text-xs font-bold uppercase tracking-wider">Xulosa</p>
                <div className="flex justify-between text-xs">
                  <span className="text-obs-400">Kategoriya</span>
                  <span className="text-white font-medium">{form.category.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-obs-400">Sarlavha</span>
                  <span className="text-white font-medium truncate ml-4 text-right">{form.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-obs-400">Narx</span>
                  <span className="text-white font-medium">
                    {form.pricing_type === 'negotiable' ? 'Kelishiladi'
                      : form.pricing_type === 'proposal' ? 'Taklif asosida'
                      : form.price_from ? `${Number(form.price_from).toLocaleString()} ${form.currency}`
                      : 'Belgilanmagan'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="flex-shrink-0 px-4 pb-safe pt-3 border-t border-obs-700 bg-obs-900">
        {step < 3 ? (
          <button onClick={() => canNext() && setStep(s => s + 1)}
            disabled={!canNext()}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={canNext() ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: '#fff' } : { background: '#1a2530', color: '#475569' }}>
            Keyingi <CaretRight size={16} weight="bold" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            {saving
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Lightning size={16} weight="fill" /> E'lon chiqarish</>}
          </button>
        )}
      </div>
    </div>
  )
}
