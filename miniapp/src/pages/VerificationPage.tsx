import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, CheckCircle, TelegramLogo, IdentificationCard, Globe } from '@phosphor-icons/react'

export default function VerificationPage() {
  const navigate = useNavigate()

  const steps = [
    { icon: TelegramLogo, title: 'Telegram akkaunt', desc: 'Telegram orqali kirgansiz', done: true },
    { icon: IdentificationCard, title: 'Shaxsiy ma\'lumotlar', desc: 'Ism va profil to\'ldirilsin', done: false },
    { icon: Globe, title: 'Faoliyat tasdiqi', desc: 'Kanal/profil URL taqdim eting', done: false },
    { icon: ShieldCheck, title: 'Verifikatsiya badge', desc: "Admin ko'rib chiqadi (1-2 kun)", done: false },
  ]

  return (
    <div className="min-h-screen bg-obs-900">
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <h1 className="text-white font-bold text-base">Verifikatsiya</h1>
      </div>

      <div className="p-4">
        {/* Header card */}
        <div className="p-5 rounded-2xl mb-6 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.12), rgba(200,168,75,0.06))', border: '1px solid rgba(13,148,136,0.2)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)' }}>
            <ShieldCheck size={32} color="#c8a84b" weight="duotone" />
          </div>
          <h2 className="text-white font-bold text-lg mb-1">Verified badge oling</h2>
          <p className="text-obs-300 text-sm leading-relaxed">
            Verifikatsiya orqali ishonch ko'rsatkichingizni oshiring va ko'proq mijoz jalb qiling
          </p>
        </div>

        {/* Steps */}
        <p className="text-obs-400 text-xs font-bold uppercase tracking-widest mb-3">Qadamlar</p>
        <div className="space-y-3 mb-6">
          {steps.map(({ icon: Icon, title, desc, done }, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-obs-800 border border-obs-700 rounded-2xl">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: done ? 'rgba(13,148,136,0.15)' : 'rgba(100,116,139,0.1)' }}>
                <Icon size={20} color={done ? '#0d9488' : '#64748b'} weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-obs-400 text-xs mt-0.5">{desc}</p>
              </div>
              {done
                ? <CheckCircle size={20} color="#0d9488" weight="fill" />
                : <div className="w-5 h-5 rounded-full border-2 border-obs-600" />}
            </div>
          ))}
        </div>

        {/* Telegram contact */}
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)' }}>
          <p className="text-teal-400 text-sm font-semibold mb-1">Murojaat qilish</p>
          <p className="text-obs-300 text-xs leading-relaxed mb-3">
            Verifikatsiya uchun @midas_support ga yozing va akkauntingiz URL ni yuboring
          </p>
          <a href="https://t.me/midas_support" target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
            <TelegramLogo size={16} weight="fill" /> @midas_support ga yozish
          </a>
        </div>
      </div>
    </div>
  )
}
