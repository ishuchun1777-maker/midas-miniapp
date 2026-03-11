import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, Target, DollarSign, Calendar, Layers, Megaphone, Paintbrush } from 'lucide-react'
import { campaignsApi, Campaign } from '@/utils/api'
import { formatPrice } from '@/utils/format'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusColors: Record<string, string> = {
    open: 'badge-green',
    in_progress: 'badge-blue',
    completed: 'badge-gold',
    cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  }

  return (
    <Link to={`/campaigns/${campaign.id}`} className="card-hover block p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={clsx('badge text-xs', statusColors[campaign.status] || 'badge-gold')}>
              {campaign.status === 'open' ? 'Ochiq' : campaign.status}
            </span>
            {campaign.needs_creative && (
              <span className="badge bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Paintbrush className="w-2.5 h-2.5" />
                Kreativ
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug">{campaign.title}</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center flex-shrink-0 ml-3">
          <Target className="w-5 h-5 text-gold-400" />
        </div>
      </div>

      {campaign.goal && (
        <p className="text-xs text-dark-400 mb-3 line-clamp-2">{campaign.goal}</p>
      )}

      <div className="grid grid-cols-3 gap-3 py-3 border-y border-dark-800 mb-3">
        {campaign.budget_max && (
          <div>
            <div className="text-[10px] text-dark-500 mb-0.5">Byudjet</div>
            <div className="text-xs font-medium text-white">
              {campaign.budget_min
                ? `${formatPrice(campaign.budget_min)}–${formatPrice(campaign.budget_max)}`
                : formatPrice(campaign.budget_max)
              }
            </div>
          </div>
        )}
        {campaign.duration_days && (
          <div>
            <div className="text-[10px] text-dark-500 mb-0.5">Davomiyligi</div>
            <div className="text-xs font-medium text-white">{campaign.duration_days} kun</div>
          </div>
        )}
        <div>
          <div className="text-[10px] text-dark-500 mb-0.5">Takliflar</div>
          <div className="text-xs font-medium text-gold-400">{campaign.proposal_count}</div>
        </div>
      </div>

      {/* Platforms */}
      {campaign.target_platforms.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {campaign.target_platforms.slice(0, 3).map((p) => (
            <span key={p} className="text-[10px] px-2 py-0.5 bg-dark-800 rounded-full text-dark-400">
              {p}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-dark-700 overflow-hidden">
            {campaign.buyer.photo_url && (
              <img src={campaign.buyer.photo_url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <span className="text-xs text-dark-400">
            {campaign.buyer.first_name}
          </span>
        </div>
        <span className="text-xs text-dark-500">
          {new Date(campaign.created_at).toLocaleDateString('uz-UZ')}
        </span>
      </div>
    </Link>
  )
}

export default function CampaignsPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [tab, setTab] = useState<'all' | 'mine'>('all')

  const { data: allCampaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list().then((r) => r.data),
  })

  const { data: myCampaigns } = useQuery({
    queryKey: ['campaigns', 'mine'],
    queryFn: () => campaignsApi.mine().then((r) => r.data),
    enabled: isAuthenticated,
  })

  const displayed = tab === 'all' ? allCampaigns?.items : myCampaigns

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title text-3xl">{t('campaign.title')}</h1>
          <p className="text-dark-400 text-sm mt-1">
            Tadbirkorlarning reklama kampaniyalariga taklif bering
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/campaigns/create" className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('campaign.create')}
          </Link>
        )}
      </div>

      {/* Tabs */}
      {isAuthenticated && (
        <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1 w-fit mb-6">
          {[{ value: 'all', label: 'Barcha' }, { value: 'mine', label: 'Mening' }].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTab(value as 'all' | 'mine')}
              className={clsx(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                tab === value ? 'bg-dark-600 text-white' : 'text-dark-400 hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="h-4 w-1/2 shimmer rounded" />
              <div className="h-5 w-3/4 shimmer rounded" />
              <div className="h-3 w-full shimmer rounded" />
              <div className="h-3 w-2/3 shimmer rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed?.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <CampaignCard campaign={campaign} />
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && (!displayed || displayed.length === 0) && (
        <div className="text-center py-20">
          <Megaphone className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">Hali kampaniyalar yo'q</p>
          {isAuthenticated && (
            <Link to="/campaigns/create" className="btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Birinchi kampaniyani yarating
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
