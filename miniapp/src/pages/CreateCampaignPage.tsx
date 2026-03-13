import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Megaphone, Target, Users, MapPin, 
  Wallet, Calendar, Lightning, ArrowLeft,
  DeviceMobile, Monitor, Buildings, TelegramLogo
} from '@phosphor-icons/react'
import { campaignsApi } from '../utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PLATFORMS = [
  { id: 'telegram', label: 'Telegram', icon: TelegramLogo },
  { id: 'youtube', label: 'YouTube', icon: Monitor },
  { id: 'instagram', label: 'Instagram', icon: DeviceMobile },
  { id: 'billboard', label: 'Billboard', icon: Buildings },
]

export default function CreateCampaignPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    business_type: '',
    goal: '',
    target_audience: '',
    city: '',
    budget_min: '',
    budget_max: '',
    duration_days: '30',
    target_platforms: [] as string[],
    needs_creative: false,
    needs_management: false,
  })

  const togglePlatform = (id: string) => {
    setFormData(p => ({
      ...p,
      target_platforms: p.target_platforms.includes(id) 
        ? p.target_platforms.filter(x => x !== id)
        : [...p.target_platforms, id]
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.budget_max) {
      toast.error('Sarlavha va budjet majburiy')
      return
    }
    setLoading(true)
    try {
      await campaignsApi.create({
        ...formData,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: parseFloat(formData.budget_max),
        duration_days: parseInt(formData.duration_days),
      })
      toast.success('Kampaniya muvaffaqiyatli yaratildi!')
      navigate('/campaigns')
    } catch (e) {
      toast.error('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obs-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-obs-300">
          <ArrowLeft size={20} weight="bold" />
        </button>
        <h1 className="text-white font-bold">Kampaniya yaratish</h1>
      </div>

      <div className="p-5">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={clsx("h-1 flex-1 rounded-full transition-all", i <= step ? "bg-teal-500" : "bg-obs-700")} />
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Megaphone size={20} color="#2dd4bf" weight="duotone" />
              </div>
              <h2 className="text-white font-bold text-lg">Asosiy ma'lumotlar</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Kampaniya sarlavhasi</label>
                <input className="input" placeholder="Masalan: Yangi do'konimiz ochilishi uchun reklama" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="label">Biznes turi</label>
                <input className="input" placeholder="Masalan: Restoran, IT-akademiya" 
                  value={formData.business_type} onChange={e => setFormData({...formData, business_type: e.target.value})} />
              </div>
              <div>
                <label className="label">Asosiy maqsad</label>
                <textarea className="input min-h-[100px] py-3" placeholder="Masalan: 5000 ta yangi obunachi yig'ish" 
                  value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} />
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2">
              Keyingisi <ArrowLeft size={18} className="rotate-180" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Target size={20} color="#2dd4bf" weight="duotone" />
              </div>
              <h2 className="text-white font-bold text-lg">Auditoriya va Budjet</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Maqsadli auditoriya</label>
                <input className="input" placeholder="Masalan: 18-35 yosh, tadbirkorlar" 
                  value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})} />
              </div>
              <div>
                <label className="label">Shahar/Hudud</label>
                <div className="relative">
                  <MapPin size={18} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input className="input pl-10" placeholder="Masalan: Toshkent" 
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Budjet (min)</label>
                  <input className="input" type="number" placeholder="500,000" 
                    value={formData.budget_min} onChange={e => setFormData({...formData, budget_min: e.target.value})} />
                </div>
                <div>
                  <label className="label">Budjet (max)</label>
                  <input className="input" type="number" placeholder="5,000,000" 
                    value={formData.budget_max} onChange={e => setFormData({...formData, budget_max: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-obs-800 text-white font-bold py-4 rounded-xl">Orqaga</button>
              <button onClick={() => setStep(3)} className="flex-[2] btn-primary py-4 rounded-xl font-bold">Davom etish</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Lightning size={20} color="#2dd4bf" weight="duotone" />
              </div>
              <h2 className="text-white font-bold text-lg">Platformalar va Yakuniy</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label mb-3 block">Kerakli platformalar</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map(({ id, label, icon: Icon }) => {
                    const isSel = formData.target_platforms.includes(id)
                    return (
                      <button key={id} onClick={() => togglePlatform(id)}
                        className={clsx(
                          "flex items-center gap-2 p-3 rounded-xl border transition-all",
                          isSel ? "border-teal-500 bg-teal-500/10 text-white" : "border-obs-700 bg-obs-800 text-obs-400"
                        )}>
                        <Icon size={18} weight={isSel ? 'fill' : 'bold'} />
                        <span className="text-sm font-bold">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="label">Davomiyligi (kun)</label>
                <div className="relative">
                  <Calendar size={18} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input className="input pl-10" type="number" value={formData.duration_days} 
                    onChange={e => setFormData({...formData, duration_days: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-obs-800 border border-obs-700">
                  <input type="checkbox" className="w-5 h-5 accent-teal-500" checked={formData.needs_creative}
                    onChange={e => setFormData({...formData, needs_creative: e.target.checked})} />
                  <span className="text-white text-sm font-medium">Kreativ xizmat kerak (dizayn, video)</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-obs-800 border border-obs-700">
                  <input type="checkbox" className="w-5 h-5 accent-teal-500" checked={formData.needs_management}
                    onChange={e => setFormData({...formData, needs_management: e.target.checked})} />
                  <span className="text-white text-sm font-medium">Marketing menejer xizmati kerak</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button onClick={() => setStep(2)} className="flex-1 bg-obs-800 text-white font-bold py-4 rounded-xl">Orqaga</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-[2] btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Kampaniyani boshlash'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
