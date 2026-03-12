import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Search, Megaphone, TrendingUp, Palette, ArrowRight, Check } from 'lucide-react'
import clsx from 'clsx'
import { usersApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const GOALS = [
  {
    id: 'buyer',
    icon: Search,
    title: 'Reklama topmoqchiman',
    desc: 'Kanal, billboard, influencer yoki media buyer topish',
    color: '#f59e0b',
  },
  {
    id: 'audience_owner',
    icon: Megaphone,
    title: 'Reklama joyim bor',
    desc: 'Telegram kanal, YouTube, billboard yoki LED ekran',
    color: '#29b6f6',
  },
  {
    id: 'marketing_operator',
    icon: TrendingUp,
    title: 'Marketing xizmat beraman',
    desc: 'Media buyer, targetolog, SMM, agentlik',
    color: '#34d399',
  },
  {
    id: 'creative_provider',
    icon: Palette,
    title: 'Kreativ xizmat beraman',
    desc: 'Dizayner, video maker, copywriter',
    color: '#a78bfa',
  },
]

interface Props {
  onDone: () => void
}

export default function OnboardingPage({ onDone }: Props) {
  const [step, setStep] = useState<'goals' | 'info'>('goals')
  const [selected, setSelected] = useState<string[]>([])
  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useAuthStore()

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    window.Telegram?.WebApp.HapticFeedback?.impactOccurred('light')
  }

  const handleGoals = () => {
    if (selected.length === 0) {
      toast.error('Kamida bitta maqsad tanlang')
      return
    }
    setStep('info')
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      for (const role of selected) {
        await usersApi.createProfile({
          role,
          display_name: displayName || user?.first_name,
          city: city || undefined,
        })
      }
      window.Telegram?.WebApp.HapticFeedback?.impactOccurred('medium')
      toast.success('Xush kelibsiz MIDAS ga! 🎉')
      onDone()
    } catch {
      onDone() // Profil allaqachon mavjud bo'lsa ham davom et
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-dark-950 flex flex-col overflow-y-auto">
      <div className="flex-1 px-5 py-6 flex flex-col">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gold-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-dark-950" fill="currentColor" />
          </div>
          <span className="font-display text-2xl tracking-widest text-white">MIDAS</span>
        </div>

        {step === 'goals' ? (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h1 className="text-white font-bold text-xl mb-1.5">
                Xush kelibsiz, {user?.first_name}! 👋
              </h1>
              <p className="text-dark-400 text-sm leading-relaxed">
                Platformadan qanday foydalanmoqchisiz?
              </p>
            </motion.div>

            <div className="flex-1 space-y-3">
              {GOALS.map(({ id, icon: Icon, title, desc, color }, i) => {
                const isSelected = selected.includes(id)
                return (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => toggle(id)}
                    className={clsx(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left active:scale-98',
                      isSelected
                        ? 'border-gold-500/50 bg-gold-500/10'
                        : 'border-dark-800 bg-dark-900'
                    )}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm mb-0.5">{title}</div>
                      <div className="text-dark-500 text-xs leading-tight">{desc}</div>
                    </div>
                    <div className={clsx(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      isSelected ? 'border-gold-500 bg-gold-500' : 'border-dark-700'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-dark-950" strokeWidth={3} />}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoals}
                disabled={selected.length === 0}
                className={clsx(
                  'w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                  selected.length > 0
                    ? 'bg-gold-500 text-dark-950 active:bg-gold-400'
                    : 'bg-dark-800 text-dark-500 cursor-not-allowed'
                )}
              >
                Davom etish
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onDone} className="w-full text-center text-dark-600 text-xs py-2">
                Hozircha o'tkazib yuborish
              </button>
            </div>
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h1 className="text-white font-bold text-xl mb-1.5">Profilingiz 📋</h1>
              <p className="text-dark-400 text-sm">Boshqalar sizi topa olishi uchun</p>
            </motion.div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block">Ism yoki kompaniya nomi</label>
                <input
                  className="input"
                  placeholder={user?.first_name || 'Ismingiz'}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block">Shahar</label>
                <input
                  className="input"
                  placeholder="Toshkent"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              {/* Tanlangan rollar */}
              <div>
                <label className="text-xs text-dark-400 mb-2 block">Tanlangan rollar</label>
                <div className="flex flex-wrap gap-2">
                  {selected.map((id) => {
                    const goal = GOALS.find((g) => g.id === id)
                    return (
                      <span key={id} className="px-3 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20">
                        {goal?.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-gold-500 text-dark-950 active:bg-gold-400"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Boshlash <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <button onClick={() => setStep('goals')} className="w-full text-center text-dark-500 text-xs py-2">
                ← Orqaga
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
