import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lightning, MagnifyingGlass, Megaphone, ChartLineUp,
  PaintBrush, ArrowRight, CheckCircle, Circle, MapPin
} from '@phosphor-icons/react'
import clsx from 'clsx'
import { usersApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const GOALS = [
  { id: 'buyer', icon: MagnifyingGlass, title: "Reklama topmoqchiman", desc: "Kanal, billboard, influencer yoki media buyer topish", color: '#c8a84b' },
  { id: 'audience_owner', icon: Megaphone, title: "Reklama joyim bor", desc: "Telegram kanal, YouTube, billboard yoki LED ekran", color: '#2dd4bf' },
  { id: 'marketing_operator', icon: ChartLineUp, title: "Marketing xizmat beraman", desc: "Media buyer, targetolog, SMM, agentlik", color: '#0d9488' },
  { id: 'creative_provider', icon: PaintBrush, title: "Kreativ xizmat beraman", desc: "Dizayner, video maker, copywriter", color: '#c8a84b' },
]

interface Props { onDone: () => void }

export default function OnboardingPage({ onDone }: Props) {
  const [step, setStep] = useState<'goals' | 'info'>('goals')
  const [selected, setSelected] = useState<string[]>([])
  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useAuthStore()

  const toggle = (id: string) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
    window.Telegram?.WebApp.HapticFeedback?.impactOccurred('light')
  }

  const handleGoals = () => {
    if (!selected.length) { toast.error('Kamida bitta maqsad tanlang'); return }
    setStep('info')
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      for (const role of selected) {
        await usersApi.createProfile({ role, display_name: displayName.trim() || user?.first_name, city: city.trim() || undefined })
      }
      window.Telegram?.WebApp.HapticFeedback?.impactOccurred('medium')
      toast.success('Xush kelibsiz MIDAS ga!')
      onDone()
    } catch { onDone() }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-obs-900 flex flex-col overflow-y-auto">
      <div className="flex-1 px-5 pt-8 pb-36">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <Lightning size={16} color="#fff" weight="fill" />
          </div>
          <span className="font-display text-2xl tracking-widest midas-gradient">MIDAS</span>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="h-1 flex-1 rounded-full bg-teal-500" />
          <div className={clsx('h-1 flex-1 rounded-full transition-all', step === 'info' ? 'bg-teal-500' : 'bg-obs-700')} />
        </div>

        {step === 'goals' ? (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h1 className="text-white font-bold text-xl mb-1.5">Xush kelibsiz, {user?.first_name}! 👋</h1>
              <p className="text-obs-300 text-sm">Platformadan qanday foydalanmoqchisiz?</p>
            </motion.div>
            <div className="space-y-3">
              {GOALS.map(({ id, icon: Icon, title, desc, color }, i) => {
                const isSel = selected.includes(id)
                return (
                  <motion.button key={id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={() => toggle(id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left active:scale-[0.98]"
                    style={{ borderColor: isSel ? 'rgba(13,148,136,0.4)' : '#1a2530', background: isSel ? 'rgba(13,148,136,0.08)' : '#0f1419' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                      <Icon size={20} weight="bold" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm mb-0.5 truncate">{title}</div>
                      <div className="text-obs-300 text-xs leading-tight line-clamp-1">{desc}</div>
                    </div>
                    <div className="flex-shrink-0">
                      {isSel ? <CheckCircle size={22} color="#0d9488" weight="fill" /> : <Circle size={22} color="#334155" />}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h1 className="text-white font-bold text-xl mb-1.5">Profilingiz</h1>
              <p className="text-obs-300 text-sm">Boshqalar sizi topa olishi uchun</p>
            </motion.div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Ism yoki kompaniya nomi</label>
                <input className="input" placeholder={user?.first_name || 'Ismingiz'} value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-obs-300 font-medium mb-1.5 block">Shahar</label>
                <div className="relative">
                  <MapPin size={16} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" weight="bold" />
                  <input className="input pl-9" placeholder="Toshkent" value={city} onChange={e => setCity(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-obs-300 font-medium mb-2 block">Tanlangan rollar</label>
                <div className="flex flex-wrap gap-2">
                  {selected.map(id => {
                    const g = GOALS.find(x => x.id === id)
                    return <span key={id} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(13,148,136,0.1)', color: '#2dd4bf', border: '1px solid rgba(13,148,136,0.2)' }}>{g?.title}</span>
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pb-safe pt-3 border-t border-obs-700" style={{ background: '#060809' }}>
        {step === 'goals' ? (
          <div className="space-y-2">
            <button onClick={handleGoals} disabled={!selected.length}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={selected.length ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: '#fff' } : { background: '#1a2530', color: '#475569' }}>
              Davom etish <ArrowRight size={16} weight="bold" />
            </button>
            <button onClick={onDone} className="w-full text-center text-obs-400 text-xs py-2">Hozircha o'tkazib yuborish</button>
          </div>
        ) : (
          <div className="space-y-2">
            <button onClick={handleFinish} disabled={saving}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lightning size={16} weight="fill" /> Boshlash</>}
            </button>
            <button onClick={() => setStep('goals')} className="w-full text-center text-obs-400 text-xs py-2">← Orqaga</button>
          </div>
        )}
      </div>
    </div>
  )
}
