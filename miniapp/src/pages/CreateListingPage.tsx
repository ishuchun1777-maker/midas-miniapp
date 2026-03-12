import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Youtube, Instagram, Monitor, MapPin,
  TrendingUp, Users, Palette, Video, PenTool,
  ChevronLeft, ChevronRight, Check, Zap, X
} from 'lucide-react'
import clsx from 'clsx'
import { listingsApi } from '../utils/api'
import toast from 'react-hot-toast'

// ─── Kategoriyalar ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    group: "📱 Ijtimoiy tarmoqlar",
    items: [
      { id: 'telegram_channel', icon: Send, label: 'Telegram kanal', color: '#29b6f6' },
      { id: 'youtube_creator', icon: Youtube, label: 'YouTube', color: '#ef4444' },
      { id: 'instagram', icon: Instagram, label: 'Instagram', color: '#e1306c' },
      { id: 'tiktok', icon: Video, label: 'TikTok', color: '#00f2ea' },
    ]
  },
  {
    group: "🏙️ Tashqi reklama",
    items: [
      { id: 'billboard', icon: MapPin, label: 'Billboard', color: '#a78bfa' },
      { id: 'led_screen', icon: Monitor, label: 'LED ekran', color: '#f59e0b' },
      { id: 'transport', icon: TrendingUp, label: 'Transport', color: '#34d399' },
    ]
  },
  {
    group: "📊 Marketing xizmatlar",
    items: [
      { id: 'media_buyer', icon: TrendingUp, label: 'Media Buyer', color: '#f59e0b' },
      { id: 'targetologist', icon: TrendingUp, label: 'Targetolog', color: '#fb923c' },
      { id: 'smm', icon: Users, label: 'SMM', color: '#34d399' },
      { id: 'marketing_agency', icon: Users, label: 'Agentlik', color: '#60a5fa' },
    ]
  },
  {
    group: "🎨 Kreativ xizmatlar",
    items: [
      { id: 'graphic_designer', icon: Palette, label: 'Dizayner', color: '#a78bfa' },
      { id: 'video_maker', icon: Video, label: 'Video maker', color: '#f43f5e' },
      { id: 'copywriter', icon: PenTool, label: 'Copywriter', color: '#22d3ee' },
      { id: 'motion_designer', icon: Zap, label: 'Motion dizayner', color: '#fbbf24' },
    ]
  },
]

const ALL_CATEGORIES = CATEGORIES.flatMap(g => g.items)

// ─── Step komponenti ──────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'h-1 rounded-full transition-all duration-300',
            i < current ? 'bg-gold-500' : i === current ? 'bg-gold-500/60 flex-1' : 'bg-dark-700',
            i === current ? 'flex-1' : 'w-6'
          )}
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateListingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    city: '',
    pricing_type: 'negotiable',
    price_from: '',
    price_to: '',
    // Telegram/Social
    telegram_channel_url: '',
    subscriber_count: '',
    avg_views: '',
    engagement_rate: '',
    // Billboard/LED
    dimensions: '',
    daily_traffic: '',
    // Ad formats
    ad_formats: [] as string[],
  })

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const selectedCat = ALL_CATEGORIES.find(c => c.id === form.category)
  const isSocial = ['telegram_channel', 'youtube_creator', 'instagram', 'tiktok'].includes(form.category)
  const isOutdoor = ['billboard', 'led_screen', 'transport'].includes(form.category)
  const isService = ['media_buyer', 'targetologist', 'smm', 'marketing_agency',
    'graphic_designer', 'video_maker', 'copywriter', 'motion_designer'].includes(form.category)

  const AD_FORMATS = isSocial
    ? ['Post', 'Story', 'Reels', 'Integration', 'Giveaway', 'Pin']
    : isOutdoor
    ? ['Statik banner', 'Animatsiyali', 'Kunlik', 'Haftalik', 'Oylik']
    : ['Loyiha asosida', 'Soatlik', 'Kunlik', 'Paket']

  const toggleFormat = (f: string) => {
    set('ad_formats', form.ad_formats.includes(f)
      ? form.ad_formats.filter(x => x !== f)
      : [...form.ad_formats, f]
    )
  }

  const canNext = () => {
    if (step === 0) return !!form.category
    if (step === 1) return form.title.length >= 3
    if (step === 2) return true
    if (step === 3) return true
    return true
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        pricing_type: form.pricing_type,
        price_from: form.price_from ? Number(form.price_from) : undefined,
        price_to: form.price_to ? Number(form.price_to) : undefined,
        city: form.city || undefined,
        ad_formats: form.ad_formats,
      }
      if (isSocial) {
        payload.telegram_channel_url = form.telegram_channel_url || undefined
        payload.subscriber_count = form.subscriber_count ? Number(form.subscriber_count) : undefined
        payload.avg_views = form.avg_views ? Number(form.avg_views) : undefined
        payload.engagement_rate = form.engagement_rate ? Number(form.engagement_rate) : undefined
      }
      if (isOutdoor) {
        payload.dimensions = form.dimensions || undefined
        payload.daily_traffic = form.daily_traffic ? Number(form.daily_traffic) : undefined
      }

      await listingsApi.create(payload)
      window.Telegram?.WebApp.HapticFeedback?.impactOccurred('medium')
      toast.success("E'lon muvaffaqiyatli qo'shildi! 🎉")
      navigate('/explore')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      toast.error(err?.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    // Step 0 — Kategoriya
    <div key="cat">
      <h2 className="text-white font-bold text-lg mb-1">Kategoriya tanlang</h2>
      <p className="text-dark-400 text-sm mb-5">Nima qo'shmoqchisiz?</p>
      <div className="space-y-4">
        {CATEGORIES.map(group => (
          <div key={group.group}>
            <p className="text-xs text-dark-500 mb-2">{group.group}</p>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map(({ id, icon: Icon, label, color }) => (
                <button
                  key={id}
                  onClick={() => set('category', id)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 text-left',
                    form.category === id
                      ? 'border-gold-500/50 bg-gold-500/10'
                      : 'border-dark-800 bg-dark-900'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-white text-xs font-medium leading-tight">{label}</span>
                  {form.category === id && (
                    <Check className="w-3.5 h-3.5 text-gold-400 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Step 1 — Asosiy ma'lumotlar
    <div key="info" className="space-y-4">
      <div>
        <h2 className="text-white font-bold text-lg mb-1">Asosiy ma'lumotlar</h2>
        <p className="text-dark-400 text-sm mb-5">
          {selectedCat && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-dark-700 bg-dark-800">
              <selectedCat.icon className="w-3 h-3" style={{ color: selectedCat.color }} />
              {selectedCat.label}
            </span>
          )}
        </p>
      </div>
      <div>
        <label className="text-xs text-dark-400 mb-1.5 block">Sarlavha *</label>
        <input
          className="input"
          placeholder={
            isSocial ? "Masalan: Toshkent Yangiliklari kanali" :
            isOutdoor ? "Masalan: Chilonzor ko'chasi billboard" :
            "Masalan: Professional SMM xizmati"
          }
          value={form.title}
          onChange={e => set('title', e.target.value)}
          maxLength={100}
        />
        <p className="text-[10px] text-dark-600 mt-1 text-right">{form.title.length}/100</p>
      </div>
      <div>
        <label className="text-xs text-dark-400 mb-1.5 block">Tavsif</label>
        <textarea
          className="input resize-none"
          rows={4}
          placeholder="Auditoriya haqida, reklama shartlari, qo'shimcha ma'lumotlar..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-dark-400 mb-1.5 block">Shahar</label>
        <input
          className="input"
          placeholder="Toshkent"
          value={form.city}
          onChange={e => set('city', e.target.value)}
        />
      </div>
    </div>,

    // Step 2 — Kategoriyaga qarab qo'shimcha
    <div key="extra" className="space-y-4">
      <h2 className="text-white font-bold text-lg mb-1">
        {isSocial ? "Kanal / sahifa ma'lumotlari" :
         isOutdoor ? "Reklama joyi ma'lumotlari" :
         "Xizmat ma'lumotlari"}
      </h2>
      <p className="text-dark-400 text-sm mb-4">Qanchalik to'liq bo'lsa, shunchalik ko'p taklif keladi</p>

      {isSocial && (
        <>
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">
              {form.category === 'telegram_channel' ? 'Kanal linki' : 'Sahifa linki'}
            </label>
            <input
              className="input"
              placeholder="https://t.me/kanalingiz"
              value={form.telegram_channel_url}
              onChange={e => set('telegram_channel_url', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-dark-400 mb-1.5 block">Obunachi soni</label>
              <input
                className="input"
                type="number"
                placeholder="50000"
                value={form.subscriber_count}
                onChange={e => set('subscriber_count', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1.5 block">O'rtacha ko'rishlar</label>
              <input
                className="input"
                type="number"
                placeholder="15000"
                value={form.avg_views}
                onChange={e => set('avg_views', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">Engagement rate (%)</label>
            <input
              className="input"
              type="number"
              placeholder="5.2"
              step="0.1"
              value={form.engagement_rate}
              onChange={e => set('engagement_rate', e.target.value)}
            />
          </div>
        </>
      )}

      {isOutdoor && (
        <>
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">O'lchamlari (m)</label>
            <input
              className="input"
              placeholder="6x3"
              value={form.dimensions}
              onChange={e => set('dimensions', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">Kunlik o'tuvchilar soni</label>
            <input
              className="input"
              type="number"
              placeholder="10000"
              value={form.daily_traffic}
              onChange={e => set('daily_traffic', e.target.value)}
            />
          </div>
        </>
      )}

      {isService && (
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-4">
          <p className="text-sm text-dark-300 text-center">
            Xizmat uchun asosiy ma'lumotlar yetarli.<br/>
            Keyinroq portfolio va narxlarni qo'shishingiz mumkin.
          </p>
        </div>
      )}

      {/* Reklama formatlari */}
      <div>
        <label className="text-xs text-dark-400 mb-2 block">Reklama formatlari</label>
        <div className="flex flex-wrap gap-2">
          {AD_FORMATS.map(f => (
            <button
              key={f}
              onClick={() => toggleFormat(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95',
                form.ad_formats.includes(f)
                  ? 'bg-gold-500/10 border-gold-500/40 text-gold-400'
                  : 'bg-dark-900 border-dark-700 text-dark-400'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3 — Narx
    <div key="price" className="space-y-4">
      <h2 className="text-white font-bold text-lg mb-1">Narx</h2>
      <p className="text-dark-400 text-sm mb-4">Narx ko'rsatsangiz ko'proq taklif keladi</p>

      <div>
        <label className="text-xs text-dark-400 mb-2 block">Narxlash turi</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'fixed', label: 'Belgilangan', desc: 'Aniq narx' },
            { id: 'negotiable', label: 'Kelishiladi', desc: 'Muzokaraga ochiq' },
            { id: 'from', label: 'Boshlang\'ich', desc: 'Narxdan boshlab' },
            { id: 'proposal', label: 'Taklif asosida', desc: 'Takliflarni ko\'rib chiqing' },
          ].map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => set('pricing_type', id)}
              className={clsx(
                'p-3 rounded-xl border transition-all text-left active:scale-95',
                form.pricing_type === id
                  ? 'border-gold-500/50 bg-gold-500/10'
                  : 'border-dark-800 bg-dark-900'
              )}
            >
              <div className="text-white text-xs font-semibold mb-0.5">{label}</div>
              <div className="text-dark-500 text-[10px]">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {['fixed', 'from', 'negotiable'].includes(form.pricing_type) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">
              {form.pricing_type === 'fixed' ? 'Narx' : 'Dan (so\'m)'}
            </label>
            <input
              className="input"
              type="number"
              placeholder="500000"
              value={form.price_from}
              onChange={e => set('price_from', e.target.value)}
            />
          </div>
          {form.pricing_type !== 'fixed' && (
            <div>
              <label className="text-xs text-dark-400 mb-1.5 block">Gacha (so'm)</label>
              <input
                className="input"
                type="number"
                placeholder="2000000"
                value={form.price_to}
                onChange={e => set('price_to', e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </div>,
  ]

  const TOTAL_STEPS = steps.length

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center active:scale-90"
        >
          <ChevronLeft className="w-4 h-4 text-dark-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-semibold text-sm">E'lon qo'shish</h1>
          <p className="text-dark-500 text-[10px]">{step + 1} / {TOTAL_STEPS} bosqich</p>
        </div>
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center">
          <X className="w-4 h-4 text-dark-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <StepIndicator current={step} total={TOTAL_STEPS} />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-dark-800 bg-dark-950">
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => canNext() && setStep(s => s + 1)}
            disabled={!canNext()}
            className={clsx(
              'w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
              canNext()
                ? 'bg-gold-500 text-dark-950 active:bg-gold-400'
                : 'bg-dark-800 text-dark-500 cursor-not-allowed'
            )}
          >
            Keyingisi
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-gold-500 text-dark-950 active:bg-gold-400"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>E'lonni chiqarish <Check className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
