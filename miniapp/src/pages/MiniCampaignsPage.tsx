import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Target, Paintbrush, Megaphone } from 'lucide-react'
import { campaignsApi, Campaign } from '../utils/api'
import { formatPrice } from '../utils/format'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

function MiniCampaignCard({ c }: { c: Campaign }) {
  return (
    <Link to={`/campaigns/${c.id}`} className="block bg-dark-900 border border-dark-800 rounded-2xl p-4 active:scale-95 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center flex-shrink-0">
          <Target className="w-4 h-4 text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
              c.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-dark-700 text-dark-400'
            )}>
              {c.status === 'open' ? 'Ochiq' : c.status}
            </span>
            {c.needs_creative && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Paintbrush className="w-2.5 h-2.5" />
                Kreativ
              </span>
            )}
          </div>
          <h3 className="text-white text-sm font-semibold line-clamp-2 leading-snug">{c.title}</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-dark-800 mb-3">
        <div className="text-center">
          <div className="text-[10px] text-dark-500 mb-0.5">Byudjet</div>
          <div className="text-[11px] font-medium text-white truncate">
            {c.budget_max ? `${formatPrice(c.budget_max)}` : '—'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-dark-500 mb-0.5">Muddat</div>
          <div className="text-[11px] font-medium text-white">{c.duration_days ? `${c.duration_days}k` : '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-dark-500 mb-0.5">Taklif</div>
          <div className="text-[11px] font-medium text-gold-400">{c.proposal_count}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-dark-700 overflow-hidden flex-shrink-0">
          {c.buyer.photo_url && <img src={c.buyer.photo_url} alt="" className="w-full h-full object-cover" />}
        </div>
        <span className="text-[11px] text-dark-400 truncate">{c.buyer.first_name}</span>
        <span className="text-[10px] text-dark-600 ml-auto">
          {new Date(c.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </Link>
  )
}

export default function MiniCampaignsPage() {
  const { isAuthenticated } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list().then((r) => r.data),
  })

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-white text-base">Kampaniyalar</h1>
          <p className="text-[11px] text-dark-400">Briflarga taklif bering</p>
        </div>
        {isAuthenticated && (
          <Link
            to="/campaigns/create"
            className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
          </Link>
        )}
      </div>

      <div className="p-4 space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-dark-900 border border-dark-800 rounded-2xl p-4 space-y-3">
                <div className="h-4 shimmer rounded w-3/4" />
                <div className="h-3 shimmer rounded w-1/2" />
                <div className="grid grid-cols-3 gap-2">
                  {[0,1,2].map(j => <div key={j} className="h-8 shimmer rounded" />)}
                </div>
              </div>
            ))
          : data?.items.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <MiniCampaignCard c={c} />
              </motion.div>
            ))
        }

        {!isLoading && (!data?.items || data.items.length === 0) && (
          <div className="text-center py-16">
            <Megaphone className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">Hali kampaniyalar yo'q</p>
          </div>
        )}
      </div>
    </div>
  )
}
