import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Check, CheckCheck, MessageSquare } from 'lucide-react'
import { chatApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

export default function MiniChatPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const { data: convs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.conversations().then((r) => r.data),
    refetchInterval: 5000,
  })

  const { data: messages } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: () => chatApi.messages(activeConvId!).then((r) => r.data),
    enabled: !!activeConvId,
    refetchInterval: 3000,
  })

  const sendMut = useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage(activeConvId!, { content, message_type: 'text' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeConvId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      setMsg('')
    },
  })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeConv = convs?.find((c) => c.id === activeConvId)

  if (activeConvId && activeConv) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Chat header */}
        <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setActiveConvId(null)}
            className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center active:scale-90 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-dark-300" />
          </button>
          <div className="w-8 h-8 rounded-full bg-dark-700 overflow-hidden">
            {activeConv.other_user?.photo_url && (
              <img src={activeConv.other_user.photo_url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {activeConv.other_user?.first_name} {activeConv.other_user?.last_name}
            </div>
            <div className="text-[10px] text-dark-500">@{activeConv.other_user?.telegram_username}</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages?.map((m) => {
              const mine = m.sender_id === user?.id
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx('flex', mine ? 'justify-end' : 'justify-start')}
                >
                  <div className={clsx(
                    'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                    mine ? 'bg-gold-500 text-dark-950 rounded-br-sm' : 'bg-dark-800 text-white rounded-bl-sm'
                  )}>
                    <p className="leading-relaxed">{m.content}</p>
                    <div className={clsx('flex items-center gap-1 mt-1', mine ? 'justify-end' : '')}>
                      <span className={clsx('text-[10px]', mine ? 'text-dark-900' : 'text-dark-500')}>
                        {new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {mine && (m.is_read
                        ? <CheckCheck className="w-3 h-3 text-dark-900" />
                        : <Check className="w-3 h-3 text-dark-900" />
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-dark-800 bg-dark-950">
          <div className="flex items-center gap-2 bg-dark-800 rounded-2xl px-4 py-2.5">
            <input
              className="flex-1 bg-transparent text-white text-sm placeholder-dark-500 focus:outline-none"
              placeholder="Xabar yozing..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && msg.trim() && sendMut.mutate(msg.trim())}
            />
            <button
              onClick={() => msg.trim() && sendMut.mutate(msg.trim())}
              disabled={!msg.trim()}
              className={clsx(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90',
                msg.trim() ? 'bg-gold-500 text-dark-950' : 'bg-dark-700 text-dark-500'
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3">
        <h1 className="font-semibold text-white">Xabarlar</h1>
      </div>

      <div>
        {convs?.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">Hali xabarlar yo'q</p>
            <p className="text-dark-600 text-xs mt-1">E'lonlarga bosib muloqot boshlang</p>
          </div>
        )}

        {convs?.map((conv) => {
          const other = conv.other_user
          return (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-dark-900 hover:bg-dark-800/50 active:bg-dark-800 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-dark-700 overflow-hidden">
                  {other?.photo_url && <img src={other.photo_url} alt="" className="w-full h-full object-cover" />}
                </div>
                {conv.unread_count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-gold-500 rounded-full text-[9px] font-bold text-dark-950 flex items-center justify-center min-w-[18px] min-h-[18px]">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-sm font-semibold text-white truncate">
                    {other?.first_name} {other?.last_name}
                  </span>
                  <span className="text-[10px] text-dark-500 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                  </span>
                </div>
                {conv.last_message && (
                  <p className="text-xs text-dark-400 truncate">{conv.last_message.content}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
