import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Zap, TrendingUp, Users, CheckCircle2,
  MessageSquare, Send, Tv2, Monitor, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { listingsApi, Listing } from '@/utils/api'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { formatNumber } from '@/utils/format'

const STATS = [
  { value: '1,200+', labelKey: 'home.stats_channels', icon: Send },
  { value: '340+', labelKey: 'home.stats_buyers', icon: TrendingUp },
  { value: '5,800+', labelKey: 'home.stats_deals', icon: CheckCircle2 },
]

const CATEGORIES = [
  { icon: Send, label: 'Telegram', to: '/explore?category=telegram_channel', color: '#29b6f6' },
  { icon: Tv2, label: 'YouTube', to: '/explore?category=youtube_creator', color: '#ef4444' },
  { icon: Monitor, label: 'LED / Billboard', to: '/explore?category=led_screen', color: '#a78bfa' },
  { icon: TrendingUp, label: 'Media Buyer', to: '/explore?category=media_buyer', color: '#f59e0b' },
  { icon: MessageSquare, label: 'SMM', to: '/explore?category=smm', color: '#34d399' },
  { icon: Users, label: 'Designer', to: '/explore?category=graphic_designer', color: '#fb923c' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: "Ro'yxatdan o'ting",
    desc: "Telegram orqali 1 daqiqada ro'yxatdan o'ting va rolingizni tanlang.",
  },
  {
    step: '02',
    title: "Toping yoki joylang",
    desc: "Reklama joyini toping yoki o'z xizmatlaringizni bozorga chiqaring.",
  },
  {
    step: '03',
    title: "Muloqot qiling",
    desc: "Platforma ichida chat, taklif va shartnoma orqali ishlang.",
  },
  {
    step: '04',
    title: "Natija oling",
    desc: "Bitimni yakunlang, to'lovni amalga oshiring, sharh qoldiring.",
  },
]

export default function HomePage() {
  const { t } = useTranslation()

  const { data: featured } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => listingsApi.featured().then((r) => r.data),
  })

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-8 py-20 noise-overlay">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute top-20 left-0 w-64 h-64 rounded-full bg-gold-500/3 blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-gold-400" fill="currentColor" />
            <span className="text-gold-400 text-xs font-medium tracking-wider uppercase">
              Advertising Operating System
            </span>
          </div>

          <h1 className="font-display text-7xl leading-none tracking-wide text-white mb-4">
            <span className="block">{t('home.hero_title')}</span>
            <span className="block gold-gradient">{t('home.hero_title2')}</span>
          </h1>

          <p className="text-dark-300 text-lg max-w-2xl mt-6 mb-8 leading-relaxed">
            {t('home.hero_sub')}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/explore" className="btn-primary text-base py-3 px-8 animate-pulse-gold">
              {t('home.cta_explore')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/explore?create=1" className="btn-secondary text-base py-3 px-8">
              {t('home.cta_list')}
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-8 mt-16 flex-wrap"
        >
          {STATS.map(({ value, labelKey, icon: Icon }) => (
            <div key={labelKey} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-display tracking-wide">{value}</div>
                <div className="text-xs text-dark-400">{t(labelKey)}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── SEARCH BAR ───────────────────────────────────────────── */}
      <section className="px-8 py-6">
        <Link
          to="/explore"
          className="flex items-center gap-3 bg-dark-900 border border-dark-700 hover:border-gold-500/40 rounded-xl px-5 py-4 max-w-2xl transition-all group"
        >
          <Search className="w-5 h-5 text-dark-400 group-hover:text-gold-400 transition-colors" />
          <span className="text-dark-400 group-hover:text-dark-300 transition-colors">
            Telegram kanal, media buyer, dizayner...
          </span>
          <div className="ml-auto bg-dark-800 rounded-lg px-3 py-1 text-xs text-dark-400">
            Qidirish
          </div>
        </Link>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────── */}
      <section className="px-8 py-8">
        <h2 className="text-sm font-medium text-dark-400 uppercase tracking-widest mb-5">
          {t('home.categories')}
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map(({ icon: Icon, label, to, color }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2.5 p-4 bg-dark-900 border border-dark-800 rounded-xl hover:border-dark-600 transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-dark-300 group-hover:text-white transition-colors text-center">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED LISTINGS ────────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title text-3xl">{t('home.featured')}</h2>
            <Link to="/explore" className="text-gold-400 text-sm hover:text-gold-300 flex items-center gap-1">
              {t('common.view_all')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 6).map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="px-8 py-12 mb-8">
        <h2 className="section-title text-3xl mb-8">{t('home.how_it_works')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {i < 3 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-gold-500/30 to-transparent z-0" />
              )}
              <div className="card p-5 relative z-10">
                <div className="font-display text-5xl text-gold-500/20 leading-none mb-3">{step}</div>
                <div className="font-semibold text-white mb-2">{title}</div>
                <div className="text-sm text-dark-400">{desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
