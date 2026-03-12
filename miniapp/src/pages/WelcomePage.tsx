import { motion } from 'framer-motion'
import {
  TelegramLogo, Lightning, Buildings, ChartLineUp,
  Star, Users, ArrowRight, CheckCircle
} from '@phosphor-icons/react'

interface Props { onEnter: () => void }

const LISTINGS = [
  { icon: '📡', name: 'Toshkent Yangiliklari', type: 'Telegram kanal', stat: '👥 120K', price: '500K so\'m/post', verified: true },
  { icon: '🏙️', name: 'Chilonzor LED Ekran', type: 'LED ekran', stat: '👁 15K/kun', price: '2M so\'m/oy', verified: true },
  { icon: '🎬', name: 'Sarvar Media', type: 'YouTube creator', stat: '👥 85K', price: '1.2M so\'m/video', verified: false },
  { icon: '🎨', name: 'DesignUz Studio', type: 'Kreativ dizayn', stat: '✅ Pro', price: '800K so\'m/loyiha', verified: true },
]

export default function WelcomePage({ onEnter }: Props) {
  return (
    <div className="fixed inset-0 bg-obs-900 overflow-y-auto">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed bottom-32 left-0 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,168,75,0.08) 0%, transparent 70%)' }} />

      <div className="px-5 pt-10 pb-32 relative z-10">

        {/* Live badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border"
          style={{ background: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-400 text-xs font-semibold tracking-wide">O'ZBEKISTON #1 AD PLATFORM</span>
        </motion.div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 8px 24px rgba(13,148,136,0.3)' }}>
              <Lightning size={24} color="#fff" weight="fill" />
            </div>
            <span className="font-display text-5xl tracking-widest midas-gradient">MIDAS</span>
          </div>
          <p className="text-obs-100 font-semibold text-lg leading-snug mb-2">
            Reklama. Marketing.<br />Hamkorlik.
          </p>
          <p className="text-obs-300 text-sm leading-relaxed">
            Brendlar, kanallar, agentliklar va kreativ mutaxassislarni birlashtiruvchi professional platforma
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mt-6 mb-6">
          {[
            { icon: <TelegramLogo size={16} weight="fill" color="#2dd4bf" />, val: '2.4K+', label: 'Kanallar' },
            { icon: <Buildings size={16} weight="fill" color="#c8a84b" />, val: '850+', label: 'Brendlar' },
            { icon: <ChartLineUp size={16} weight="bold" color="#2dd4bf" />, val: '4.2M+', label: 'Bitimlar' },
          ].map(({ icon, val, label }) => (
            <div key={label} className="bg-obs-800 border border-obs-700 rounded-2xl p-3 text-center">
              <div className="flex justify-center mb-1">{icon}</div>
              <div className="font-display text-xl midas-gradient">{val}</div>
              <div className="text-obs-300 text-[10px] font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Featured listings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-obs-300 text-xs font-bold tracking-widest uppercase">Top reklama joylari</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(200,168,75,0.1)', color: '#c8a84b', border: '1px solid rgba(200,168,75,0.2)' }}>
              ✦ Verified
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {LISTINGS.map((l, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex-shrink-0 w-[140px] bg-obs-800 border border-obs-700 rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-obs-700 flex items-center justify-center text-lg flex-shrink-0">
                    {l.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-[11px] font-semibold truncate-safe">{l.name}</div>
                    <div className="text-obs-300 text-[9px] truncate-safe">{l.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={{ background: 'rgba(13,148,136,0.12)', color: '#2dd4bf' }}>{l.stat}</span>
                  {l.verified && (
                    <CheckCircle size={12} color="#c8a84b" weight="fill" />
                  )}
                </div>
                <div className="text-gold-500 text-[10px] font-bold mb-2 truncate-safe">{l.price}</div>
                <button className="w-full h-7 rounded-lg text-white text-[9px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                  Ko'rish
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="flex items-center gap-3 mt-5 mb-6 p-3 bg-obs-800 border border-obs-700 rounded-2xl">
          <div className="flex">
            {['👤', '👤', '👤', '👤'].map((av, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-obs-700 border-2 border-obs-800 flex items-center justify-center text-xs"
                style={{ marginLeft: i > 0 ? '-8px' : '0' }}>{av}</div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold">
              <span style={{ color: '#2dd4bf' }}>1,200+</span> mutaxassis
            </div>
            <div className="text-obs-300 text-[10px]">allaqachon platformada ishlaydi</div>
          </div>
          <div className="flex">
            {[1,2,3,4,5].map(i => <Star key={i} size={10} color="#c8a84b" weight="fill" />)}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="space-y-2 mb-6">
          {[
            { icon: <TelegramLogo size={14} weight="fill" color="#2dd4bf" />, text: 'Telegram, YouTube, Billboard, LED ekranlar' },
            { icon: <Users size={14} weight="bold" color="#c8a84b" />, text: 'Media buyer, targetolog, dizayner, agentlik' },
            { icon: <ChartLineUp size={14} weight="bold" color="#2dd4bf" />, text: 'Kampaniya → Taklif → Chat → Kelishuv' },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-obs-200 text-xs">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-obs-800 border border-obs-700">
                {icon}
              </div>
              <span className="leading-relaxed">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-safe pt-3"
        style={{ background: 'linear-gradient(to top, #060809 60%, transparent)' }}>
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          onClick={onEnter}
          className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 8px 28px rgba(13,148,136,0.35)' }}>
          <TelegramLogo size={18} weight="fill" />
          Telegram orqali kirish
          <ArrowRight size={16} weight="bold" />
        </motion.button>
        <p className="text-center text-obs-400 text-[10px] mt-2 pb-1">
          Bepul • Bir daqiqada ro'yxatdan o'ting
        </p>
      </div>
    </div>
  )
}
