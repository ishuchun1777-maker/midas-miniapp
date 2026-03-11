import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Send, Paperclip, Search, CheckCheck, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatApi, Conversation, Message } from '@/utils/api'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversations } = useQuery({
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

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage(activeConvId!, { content, message_type: 'text' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeConvId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      setMessage('')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeConv = conversations?.find((c) => c.id === activeConvId)

  const handleSend = () => {
    if (!message.trim() || !activeConvId) return
    sendMutation.mutate(message.trim())
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
      <div className="w-72 border-r border-dark-800 flex flex-col">
        <div className="p-4 border-b border-dark-800">
          <h1 className="font-semibold text-white mb-3">{t('chat.title')}</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" />
            <input className="input pl-9 text-sm py-2" placeholder="Qidirish..." />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations?.length === 0 && (
            <div className="p-8 text-center text-dark-400 text-sm">
              {t('chat.no_conversations')}
            </div>
          )}
          {conversations?.map((conv) => {
            const other = conv.other_user
            const isActive = conv.id === activeConvId
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={clsx(
                  'w-full flex items-start gap-3 p-4 border-b border-dark-900 hover:bg-dark-800/50 transition-colors text-left',
                  isActive && 'bg-dark-800'
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-dark-700 overflow-hidden">
                    {other?.photo_url && (
                      <img src={other.photo_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center text-[9px] font-bold text-dark-950">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-white truncate">
                      {other?.first_name} {other?.last_name}
                    </span>
                    <span className="text-[10px] text-dark-500 flex-shrink-0 ml-1">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-dark-400 truncate">
                      {conv.last_message.content}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── CHAT AREA ──────────────────────────────────────────── */}
      {activeConvId && activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-14 border-b border-dark-800 px-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-dark-700 overflow-hidden">
              {activeConv.other_user?.photo_url && (
                <img src={activeConv.other_user.photo_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {activeConv.other_user?.first_name} {activeConv.other_user?.last_name}
              </div>
              <div className="text-xs text-dark-400">
                @{activeConv.other_user?.telegram_username}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <AnimatePresence initial={false}>
              {messages?.map((msg) => {
                const isMine = msg.sender_id === user?.id
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx('flex', isMine ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={clsx(
                        'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm',
                        isMine
                          ? 'bg-gold-500 text-dark-950 rounded-br-sm'
                          : 'bg-dark-800 text-white rounded-bl-sm'
                      )}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <div className={clsx('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
                        <span className={clsx('text-[10px]', isMine ? 'text-dark-800' : 'text-dark-500')}>
                          {new Date(msg.created_at).toLocaleTimeString('uz-UZ', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {isMine && (
                          msg.is_read
                            ? <CheckCheck className="w-3 h-3 text-dark-800" />
                            : <Check className="w-3 h-3 text-dark-800" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-dark-800">
            <div className="flex items-center gap-3 bg-dark-800 rounded-xl px-4 py-2.5">
              <button className="text-dark-400 hover:text-white transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                className="flex-1 bg-transparent text-white text-sm placeholder-dark-500 focus:outline-none"
                placeholder={t('chat.placeholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  message.trim()
                    ? 'bg-gold-500 text-dark-950 hover:bg-gold-400'
                    : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-dark-500" />
            </div>
            <p className="text-dark-400 text-sm">Suhbat tanlang</p>
          </div>
        </div>
      )}
    </div>
  )
}
