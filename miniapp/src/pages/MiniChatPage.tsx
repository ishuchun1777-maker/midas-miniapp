import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ChatCircle, User, PaperPlaneTilt,
  Paperclip, CheckCircle
} from '@phosphor-icons/react'
import { chatApi, Conversation, Message } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })
}
function formatDay(d: string) {
  const date = new Date(d)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Bugun'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Kecha'
  return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
}

// ── ChatView ─────────────────────────────────────────────────────────────────
function ChatView({ conv, onBack }: { conv: Conversation; onBack: () => void }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [msg, setMsg] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conv.id],
    queryFn: () => chatApi.messages(conv.id).then(r => r.data),
    refetchInterval: 3000,
  })

  const sendMut = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(conv.id, { content, message_type: 'text' }),
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
    window.Telegram?.WebApp.HapticFeedback?.impactOccurred('light')
  }

  const other = conv.other_user

  // Group messages by day
  const grouped: { day: string; msgs: Message[] }[] = []
  for (const m of messages) {
    const day = formatDay(m.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.day === day) last.msgs.push(m)
    else grouped.push({ day, msgs: [m] })
  }

  return (
    <div className="flex flex-col h-screen bg-obs-900">
      {/* Header */}
      <div className="glass border-b border-obs-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl bg-obs-800 border border-obs-700 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        {other?.photo_url
          ? <img src={other.photo_url} alt="" className="w-10 h-10 rounded-2xl object-cover border border-obs-700" />
          : <div className="w-10 h-10 rounded-2xl bg-obs-800 border border-obs-700 flex items-center justify-center">
              <User size={18} color="#64748b" weight="bold" />
            </div>}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">{other?.first_name} {other?.last_name || ''}</p>
          {other?.telegram_username && <p className="text-obs-300 text-[11px]">@{other.telegram_username}</p>}
        </div>
        <div className="w-2 h-2 rounded-full bg-teal-400" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ChatCircle size={40} color="#334155" weight="duotone" />
            <p className="text-obs-300 text-sm mt-3 font-medium">Chat boshlang</p>
            <p className="text-obs-400 text-xs mt-1">Birinchi xabar yuboring</p>
          </div>
        )}

        {grouped.map(({ day, msgs }) => (
          <div key={day}>
            {/* Day separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-obs-700" />
              <span className="text-obs-400 text-[10px] font-medium px-2">{day}</span>
              <div className="flex-1 h-px bg-obs-700" />
            </div>

            {msgs.map((m) => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} className={clsx('flex mb-2', isMe ? 'justify-end' : 'justify-start')}>
                  <div className={clsx(
                    'max-w-[78%] px-3.5 py-2.5 rounded-2xl',
                    isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
                  )}
                    style={isMe
                      ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' }
                      : { background: '#0f1419', border: '1px solid #1a2530' }}>
                    {m.file_url && (
                      <a href={m.file_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 mb-1 text-xs underline"
                        style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#2dd4bf' }}>
                        <Paperclip size={12} weight="bold" />
                        Fayl
                      </a>
                    )}
                    {m.content && <p className="text-white text-sm leading-relaxed">{m.content}</p>}
                    <div className={clsx('flex items-center gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
                      <span className={clsx('text-[10px]', isMe ? 'text-white/60' : 'text-obs-400')}>
                        {formatTime(m.created_at)}
                      </span>
                      {isMe && <CheckCircle size={10} color="rgba(255,255,255,0.6)" weight="bold" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-obs-700 glass flex items-center gap-2"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}>
        <input ref={inputRef}
          className="flex-1 bg-obs-800 border border-obs-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-obs-400 outline-none focus:border-teal-500 transition-colors"
          placeholder="Xabar yozing..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
        <button onClick={handleSend} disabled={!msg.trim() || sendMut.isPending}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          style={msg.trim() ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : { background: '#1a2530' }}>
          {sendMut.isPending
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <PaperPlaneTilt size={18} color={msg.trim() ? '#fff' : '#475569'} weight="fill" />}
        </button>
      </div>
    </div>
  )
}

// ── Conversation List ─────────────────────────────────────────────────────────
function ConvList({ convs, onSelect }: { convs: Conversation[]; onSelect: (c: Conversation) => void }) {
  if (convs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-obs-800 flex items-center justify-center mb-4">
          <ChatCircle size={32} color="#334155" weight="duotone" />
        </div>
        <p className="text-obs-300 font-medium">Hali chatlar yo'q</p>
        <p className="text-obs-400 text-sm mt-1">Biror e'londan "Aloqa" tugmasini bosing</p>
      </div>
    )
  }
  return (
    <div>
      {convs.map((conv, i) => {
        const other = conv.other_user
        return (
          <motion.button key={conv.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(conv)}
            className="w-full flex items-center gap-3 px-4 py-4 border-b border-obs-800 active:bg-obs-800 transition-all">
            <div className="relative flex-shrink-0">
              {other?.photo_url
                ? <img src={other.photo_url} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                : <div className="w-12 h-12 rounded-2xl bg-obs-800 border border-obs-700 flex items-center justify-center">
                    <User size={20} color="#64748b" weight="bold" />
                  </div>}
              {conv.unread_count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-obs-900"
                  style={{ background: '#c8a84b' }}>{conv.unread_count}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white text-sm font-semibold truncate">
                  {other?.first_name} {other?.last_name || ''}
                </span>
                {conv.last_message && (
                  <span className="text-obs-400 text-[10px] flex-shrink-0 ml-2">
                    {formatTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              <span className={clsx('text-xs truncate block', conv.unread_count > 0 ? 'text-white font-medium' : 'text-obs-400')}>
                {conv.last_message?.content || 'Chat boshlandi'}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MiniChatPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [searchParams] = useSearchParams()

  const { data: convs = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.conversations().then(r => r.data),
    refetchInterval: 5000,
  })

  // Agar URL da ?conv=ID bo'lsa — o'sha chatni ochish
  useEffect(() => {
    const convId = searchParams.get('conv')
    if (convId && convs.length > 0) {
      const found = convs.find(c => c.id === Number(convId))
      if (found) setActiveConv(found)
    }
  }, [convs, searchParams])

  if (activeConv) {
    return <ChatView conv={activeConv} onBack={() => setActiveConv(null)} />
  }

  return (
    <div className="min-h-screen bg-obs-900">
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3">
        <h1 className="text-white font-bold text-lg">Chatlar</h1>
      </div>

      {isLoading ? (
        <div>
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-obs-800">
              <div className="w-12 h-12 rounded-2xl shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 shimmer rounded w-2/3" />
                <div className="h-3 shimmer rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ConvList convs={convs} onSelect={setActiveConv} />
      )}
    </div>
  )
}
