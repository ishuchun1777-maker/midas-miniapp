import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { Zap, Send, TrendingUp, Users, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/utils/api'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { t } = useTranslation()
  const { isAuthenticated, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  // ✅ Telegram Mini App ochilganda avtomatik login
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) return

    // WebApp tayyor bo'lishini kutish
    tg.ready()

    const initData = tg.initData
    if (initData) {
      handleTelegramLogin(initData)
    }
  }, [])

  const handleTelegramLogin = async (initData?: string) => {
    const data = initData || (window as any).Telegram?.WebApp?.initData

    if (!data) {
      toast.error('Bu funksiya faqat Telegram Mini App ichida ishlaydi')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.telegramLogin(data)
      setAuth(res.data.access_token, res.data.user)
      toast.success('Muvaffaqiyatli kirdingiz!')
    } catch {
      toast.error('Kirish xato. Qayta urinib ko\'ring.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // ... qolgan kod o'zgarishsiz ...
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="flex-1 relative overflow-hidden noise-overlay p-12 flex flex-col justify-between hidden md:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-dark-950" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-dark-950 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-dark-950" fill="currentColor" />
            </div>
            <span className="font-display text-4xl tracking-widest">MIDAS</span>
          </div>
        </div>
        <div className="relative">
          <h2 className="font-display text-5xl leading-tight mb-4">
            Reklama bozori<br />
            <span className="gold-gradient">professional tarzda</span>
          </h2>
          <p className="text-dark-400 text-base leading-relaxed max-w-sm">
            Telegram kanallar, media buyerlar, dizaynerlar va tadbirkorlarni yagona tizimda birlashtiruvchi platforma
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { icon: Send, label: '1,200+ Telegram kanal' },
              { icon: TrendingUp, label: '340+ Media buyer' },
              { icon: Users, label: '5,800+ Yakunlangan bitim' },
              { icon: Shield, label: '100% Tasdiqlangan' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-dark-400">
                <div className="w-7 h-7 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-gold-400" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Auth */}
      <div className="w-full md:w-[420px] flex items-center justify-center p-8 border-l border-dark-800">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-dark-950" fill="currentColor" />
            </div>
            <span className="font-display text-3xl tracking-widest">MIDAS</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.welcome')}</h1>
          <p className="text-dark-400 text-sm mb-8">
            Telegram orqali tizimga kiring va reklama bozorini kashf eting
          </p>
          <button
            onClick={() => handleTelegramLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#29b6f6] hover:bg-[#039be5] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-5 h-5" fill="white" />
            {loading ? 'Kirish...' : t('auth.login_with_telegram')}
          </button>
          <p className="text-center text-xs text-dark-500 mt-6">
            Kirib, siz platformaning{' '}
            <a href="#" className="text-gold-400 hover:underline">foydalanish shartlari</a>
            {' '}va{' '}
            <a href="#" className="text-gold-400 hover:underline">maxfiylik siyosati</a>
            {' '}bilan rozisiz
          </p>
        </div>
      </div>
    </div>
  )
}
