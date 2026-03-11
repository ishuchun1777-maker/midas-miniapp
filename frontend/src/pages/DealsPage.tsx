import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Handshake, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { dealsApi, Deal } from '@/utils/api'
import { formatPrice } from '@/utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  lead:        { label: "Yangi",      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",    icon: Clock },
  negotiation: { label: "Muzokara",  color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  agreed:      { label: "Kelishildi",color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  in_progress: { label: "Jarayonda", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: Clock },
  completed:   { label: "Yakunlandi",color: "text-gold-400 bg-gold-500/10 border-gold-500/20",    icon: CheckCircle },
  cancelled:   { label: "Bekor",     color: "text-red-400 bg-red-500/10 border-red-500/20",       icon: XCircle },
}

function DealCard({ deal }: { deal: Deal }) {
  const qc = useQueryClient()
  const cfg = STATUS_CONFIG[deal.status] || STATUS_CONFIG.lead
  const Icon = cfg.icon

  const updateMut = useMutation({
    mutationFn: (status: string) => dealsApi.update(deal.id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success("Holat yangilandi") },
  })

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white mb-1">{deal.title}</h3>
          <div className="flex items-center gap-2">
            <span className={clsx("badge text-xs border", cfg.color)}>
              <Icon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gold-400 font-bold text-lg">{formatPrice(deal.price)}</div>
          <div className="text-xs text-dark-500">so'm</div>
        </div>
      </div>

      <div className="flex items-center gap-4 py-3 border-y border-dark-800 mb-4">
        <div>
          <div className="text-[10px] text-dark-500 mb-1">Xaridor</div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-dark-700 overflow-hidden">
              {deal.buyer.photo_url && <img src={deal.buyer.photo_url} alt="" className="w-full h-full object-cover"/>}
            </div>
            <span className="text-xs text-dark-300">{deal.buyer.first_name}</span>
          </div>
        </div>
        <div className="text-dark-700">→</div>
        <div>
          <div className="text-[10px] text-dark-500 mb-1">Provider</div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-dark-700 overflow-hidden">
              {deal.provider.photo_url && <img src={deal.provider.photo_url} alt="" className="w-full h-full object-cover"/>}
            </div>
            <span className="text-xs text-dark-300">{deal.provider.first_name}</span>
          </div>
        </div>
        {deal.deadline && (
          <div className="ml-auto text-right">
            <div className="text-[10px] text-dark-500 mb-0.5">Muddat</div>
            <div className="text-xs text-dark-300">{new Date(deal.deadline).toLocaleDateString('uz-UZ')}</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {deal.status === 'lead' && (
          <button onClick={() => updateMut.mutate('negotiation')} className="btn-secondary text-xs py-1.5 px-3">
            Muzokara boshlash
          </button>
        )}
        {deal.status === 'negotiation' && (
          <button onClick={() => updateMut.mutate('agreed')} className="btn-primary text-xs py-1.5 px-3">
            Kelishildi
          </button>
        )}
        {deal.status === 'agreed' && (
          <button onClick={() => updateMut.mutate('in_progress')} className="btn-primary text-xs py-1.5 px-3">
            Boshlash
          </button>
        )}
        {deal.status === 'in_progress' && (
          <button onClick={() => updateMut.mutate('completed')} className="btn-primary text-xs py-1.5 px-3">
            Yakunlash
          </button>
        )}
      </div>
    </div>
  )
}

export default function DealsPage() {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list().then((r) => r.data),
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title text-3xl">Bitimlar</h1>
          <p className="text-dark-400 text-sm mt-1">Barcha faol va yakunlangan bitimlar</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card p-5 space-y-3">
            <div className="h-4 shimmer rounded w-2/3"/><div className="h-3 shimmer rounded w-1/3"/>
          </div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {deals?.map((deal, i) => (
            <motion.div key={deal.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <DealCard deal={deal} />
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && deals?.length === 0 && (
        <div className="text-center py-20">
          <Handshake className="w-12 h-12 text-dark-700 mx-auto mb-4"/>
          <p className="text-dark-400">Hali bitimlar yo'q</p>
        </div>
      )}
    </div>
  )
}
