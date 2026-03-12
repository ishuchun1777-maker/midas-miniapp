import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, PaperPlaneTilt, ChatCircle, Handshake, CheckCircle, Circle } from '@phosphor-icons/react'
import { notificationsApi } from '../utils/api'
import { formatDate } from '../utils/format'

const NOTIF_ICONS: Record<string, JSX.Element> = {
  new_proposal: <PaperPlaneTilt size={18} color="#2dd4bf" weight="bold" />,
  proposal_accepted: <CheckCircle size={18} color="#0d9488" weight="fill" />,
  new_message: <ChatCircle size={18} color="#c8a84b" weight="bold" />,
  deal_created: <Handshake size={18} color="#2dd4bf" weight="bold" />,
  deal_completed: <CheckCircle size={18} color="#0d9488" weight="fill" />,
}

const NOTIF_COLORS: Record<string, string> = {
  new_proposal: 'rgba(13,148,136,0.12)',
  proposal_accepted: 'rgba(13,148,136,0.15)',
  new_message: 'rgba(200,168,75,0.1)',
  deal_created: 'rgba(13,148,136,0.12)',
  deal_completed: 'rgba(13,148,136,0.15)',
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
  })

  const markRead = useMutation({
    mutationFn: () => notificationsApi.markRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const handleNotifClick = (notif: typeof notifications extends (infer T)[] | undefined ? T : never) => {
    if (!notif) return
    markRead.mutate()
    const data = notif.data as Record<string, unknown>
    if (notif.type === 'new_message' && data.conversation_id) {
      navigate(`/messages?conv=${data.conversation_id}`)
    } else if (data.listing_id) {
      navigate(`/listing/${data.listing_id}`)
    } else if (data.campaign_id) {
      navigate(`/campaigns`)
    }
  }

  return (
    <div className="min-h-screen bg-obs-900">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <h1 className="flex-1 text-white font-bold text-base">Bildirishnomalar</h1>
        {notifications && notifications.some(n => !n.is_read) && (
          <button onClick={() => markRead.mutate()} className="text-teal-400 text-xs font-medium">
            Barchasini o'qildi
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-obs-800 rounded-2xl shimmer" />)}
        </div>
      ) : !notifications?.length ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-obs-800 flex items-center justify-center mb-4">
            <Bell size={32} color="#334155" weight="duotone" />
          </div>
          <p className="text-obs-300 font-medium">Bildirishnomalar yo'q</p>
          <p className="text-obs-400 text-sm mt-1">Yangi taklif yoki xabar kelganda bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="divide-y divide-obs-800">
          {notifications.map((n, i) => (
            <motion.button key={n.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => handleNotifClick(n)}
              className="w-full flex items-start gap-3 px-4 py-4 text-left active:bg-obs-800 transition-all">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: NOTIF_COLORS[n.type] || 'rgba(13,148,136,0.1)' }}>
                {NOTIF_ICONS[n.type] || <Bell size={18} color="#64748b" weight="bold" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm truncate">{n.title}</span>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />}
                </div>
                {n.body && <p className="text-obs-300 text-xs line-clamp-2 leading-relaxed">{n.body}</p>}
                <p className="text-obs-400 text-[10px] mt-1">{formatDate(n.created_at)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
