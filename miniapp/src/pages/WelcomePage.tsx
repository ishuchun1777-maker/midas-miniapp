import { motion } from 'framer-motion'
import {
  TelegramLogo, Lightning, Buildings, 
  Star, Users, CheckCircle
} from '@phosphor-icons/react'

interface Props { 
  onEnter: () => void
  onGuest: () => void
}

const LISTINGS = [
  { icon: '📡', name: 'Toshkent Yangiliklari', type: 'Telegram kanal', stat: '👥 120K', price: '500K so\'m/post', verified: true },
  { icon: '🏙️', name: 'Chilonzor LED Ekran', type: 'LED ekran', stat: '👁 15K/kun', price: '2M so\'m/oy', verified: true },
  { icon: '🎬', name: 'Sarvar Media', type: 'YouTube creator', stat: '👥 85K', price: '1.2M so\'m/video', verified: false },
  { icon: '🎨', name: 'DesignUz Studio', type: 'Kreativ dizayn', stat: '✅ Pro', price: '800K so\'m/loyiha', verified: true },
]

export default function WelcomePage({ onEnter, onGuest }: Props) {
  return (
    <div className="fixed inset-0 bg-obs-900 overflow-y-auto overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed bottom-32 left-0 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,168,75,0.08) 0%, transparent 70%)' }} />

      <div className="px-5 pt-10 pb-40 relative z-10">

        {/* Live badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border"
          style={{ background: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-400 text-xs font-semibold tracking-wide uppercase">MIDAS: Professional Reklama Maydoni</span>
        </motion.div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 8px 24px rgba(13,148,136,0.3)' }}>
              <Lightning size={24} color="#fff" weight="fill" />
            </div>
            <span className="font-display text-5xl tracking-widest font-bold italic midas-gradient">MIDAS</span>
          </div>
          <h1 className="text-white font-bold text-2xl leading-tight mb-3">
            O'zbekistondagi eng yirik reklama boti
          </h1>
          <p className="text-obs-300 text-sm leading-relaxed mb-6">
            Midas — bu reklama beruvchilar va ijrochilar (kanal egalari, dizaynerlar, targetologlar)ni birlashtiruvchi markazdir. 
            Xavfsiz to'lovlar, keng bozor va qulay interfeys bilan reklama kampaniyalaringizni boshqaring.
          </p>
        </motion.div>

        {/* Info Grid */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-obs-800/50 backdrop-blur border border-obs-700 p-4 rounded-2xl">
            <div className="text-teal-400 mb-2"><TelegramLogo size={24} weight="fill" /></div>
            <div className="text-white font-bold text-sm mb-1 font-display uppercase tracking-wider">Reklama bering</div>
            <div className="text-obs-400 text-[10px]">O'zingizga mos kanal va ijrochilarni toping</div>
          </div>
          <div className="bg-obs-800/50 backdrop-blur border border-obs-700 p-4 rounded-2xl">
            <div className="text-gold-500 mb-2"><Buildings size={24} weight="fill" /></div>
            <div className="text-white font-bold text-sm mb-1 font-display uppercase tracking-wider">Daromad qiling</div>
            <div className="text-obs-400 text-[10px]">E'lon joylang va buyurtmalar qabul qiling</div>
          </div>
        </motion.div>

        {/* Featured Title */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-obs-300 text-[10px] font-bold tracking-widest uppercase">Reklama bozori ko'rinishi</span>
          <div className="h-[1px] flex-1 bg-obs-700 mx-4" />
        </div>

        {/* Featured listings - visual only for welcome */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 mb-8">
          {LISTINGS.map((l, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              className="flex-shrink-0 w-[160px] bg-obs-800 border border-obs-700 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-obs-700 flex items-center justify-center text-xl shadow-inner">
                  {l.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-[11px] font-bold truncate">{l.name}</div>
                  <div className="text-obs-400 text-[9px] truncate">{l.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(13,148,136,0.15)', color: '#2dd4bf' }}>{l.stat}</span>
                {l.verified && <CheckCircle size={12} color="#c8a84b" weight="fill" />}
              </div>
              <div className="text-gold-500 text-xs font-bold">{l.price}</div>
            </motion.div>
          ))}
        </div>

        {/* Platform trust */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-obs-800/30 border border-obs-700/50 rounded-2xl p-4 text-center mb-10">
          <p className="text-obs-300 text-xs mb-3">Siz yuzlab professionallar bilan birgasiz</p>
          <div className="flex justify-center -space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-obs-900 bg-obs-700 flex items-center justify-center text-[10px]">👤</div>
            ))}
          </div>
          <div className="flex justify-center text-gold-500 gap-0.5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} weight="fill" />)}
          </div>
        </motion.div>

      </div>

      {/* FIXED CTAs */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-6"
        style={{ background: 'linear-gradient(to top, #060809 85%, transparent)' }}>
        
        <div className="flex flex-col gap-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            onClick={onEnter}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            style={{ 
              background: 'linear-gradient(135deg, #0d9488, #0f766e)', 
              boxShadow: '0 8px 32px rgba(13,148,136,0.3)' 
            }}>
            <Lightning size={20} weight="fill" />
            Platformada ro'yxatdan o'tish
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
            onClick={onGuest}
            className="w-full py-4 rounded-2xl text-obs-200 font-bold text-sm flex items-center justify-center gap-2 border border-obs-700 bg-obs-800/50 active:scale-[0.98] transition-all">
            <Users size={18} weight="bold" />
            Ro'yxatdan o'tmasdan bozorni ko'rish
          </motion.button>
        </div>

        <p className="text-center text-obs-500 text-[10px] mt-4 font-medium uppercase tracking-widest">
          MIDAS v1.5 • 2024
        </p>
      </div>
    </div>
  )
}
