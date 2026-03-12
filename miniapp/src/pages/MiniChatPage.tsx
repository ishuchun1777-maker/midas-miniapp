import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Send, ArrowLeft, MessageSquare, User } from 'lucide-react'
import { chatApi, Conversation, Message } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })
}

function ConversationList({
  convs,
  onSelect,
}: {
  convs: Conversation[]
  onSelect: (c: Conversation) => void
}) {
  const { user } = useAuthStore()
  if (convs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <MessageSquare className="w-12 h-12 text-dark-700 mb-3" />
        <p className="text-dark-400 text-sm">Hali chatlar yo'q</p>
        <p className="text-dark-600 text-xs mt-1">Biror listingdan "Aloqa" bosing</p>
      </div>
    )
  }

  return (
    <div>
      {convs.map((conv) => {
        const other = conv.other_user
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-dark-800 active:bg-dark-900 transition-all"
          >
            {other?.photo_url ? (
              <img src={other.photo_url} alt="" className="w-11 h-11 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-dark-800 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-dark-400" />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white text-sm font-medium truncate">
                  {other?.first_name} {other?.last_name || ''}
                </span>
                {conv.last_message && (
                  <span className="text-dark-500 text-[10px] flex-shrink-0 ml-2">
                    {formatTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-500 text-xs truncate">
                  {conv.last_message?.content || 'Chat boshlandi'}
                </span>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 bg-gold-500 rounded-full text-[10px] font-bold text-dark-950 flex items-center justify-center flex-shrink-0 ml-2">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ChatView({
  conv,
  onBack,
}: {
  conv: Conversation
  onBack: () => void
}) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [msg, setMsg] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const { data: messages } = useQuery({
    queryKey: ['messages', conv.id],
    queryFn: () => chatApi.messages(conv.id).then((r) => r.data),
    refetchInterval: 3000,
  })

  const sendMut = useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage(conv.id, { content, message_type: 'text' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', conv.id] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      setMsg('')
    },
  })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = msg.trim()
    if (!text || sendMut.isPending) return
    sendMut.mutate(text)
  }

  const other = conv.other_user

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-dark-300" />
        </button>
        {other?.photo_url ? (
          <img src={other.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center">
            <User className="w-4 h-4 text-dark-400" />
          </div>
        )}
        <div>
          <p className="text-white text-sm font-semibold">{other?.first_name} {other?.last_name || ''}</p>
          {other?.telegram_username && (
            <p className="text-dark-500 text-[11px]">@{other.telegram_username}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages?.map((m) => {
          const isMe = m.sender_id === user?.id
          return (
            <div key={m.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[75%] px-3 py-2 rounded-2xl text-sm',
                  isMe
                    ? 'bg-gold-500 text-dark-950 rounded-br-sm'
                    : 'bg-dark-800 text-white rounded-bl-sm'
                )}
              >
                <p className="leading-relaxed">{m.content}</p>
                <p className={clsx('text-[10px] mt-0.5 text-right', isMe ? 'text-dark-950/60' : 'text-dark-500')}>
                  {formatTime(m.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-dark-800 glass flex items-center gap-2">
        <input
          className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-dark-500 outline-none focus:border-gold-500/50"
          placeholder="Xabar yozing..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!msg.trim() || sendMut.isPending}
          className="w-10 h-10 rounded-xl bg-gold-500 disabled:bg-dark-700 flex items-center justify-center transition-all active:scale-95"
        >
          <Send className="w-4 h-4 text-dark-950 disabled:text-dark-500" />
        </button>
      </div>
    </div>
  )
}

export default function MiniChatPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)

  const { data: convs, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.conversations().then((r) => r.data),
    refetchInterval: 5000,
  })

  if (activeConv) {
    return <ChatView conv={activeConv} onBack={() => setActiveConv(null)} />
  }

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-dark-800 px-4 py-3">
        <h1 className="text-white font-bold text-lg">Chatlar</h1>
      </div>

      {isLoading ? (
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-dark-800">
              <div className="w-11 h-11 rounded-2xl shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 shimmer rounded w-2/3" />
                <div className="h-3 shimmer rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ConversationList convs={convs || []} onSelect={setActiveConv} />
      )}
    </div>
  )
}
