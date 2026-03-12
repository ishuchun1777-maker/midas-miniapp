import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, PaperPlaneTilt, CurrencyDollar, ChartLineUp, ChatText } from '@phosphor-icons/react'
import { listingsApi, campaignsApi } from '../utils/api'
import toast from 'react-hot-toast'

interface Props { type: 'listing' | 'campaign' }

export default function ProposalPage({ type }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState({ price: '', expected_result: '', message: '' })
  const [saving, setSaving] = useState(false)

  const { data: listing } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.get(Number(id)).then(r => r.data),
    enabled: type === 'listing' && !!id,
  })

  const { data: campaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.get(Number(id)).then(r => r.data),
    enabled: type === 'campaign' && !!id,
  })

  const target = type === 'listing' ? listing : campaign
  const targetTitle = target ? ('title' in target ? target.title : '') : ''

  const handleSubmit = async () => {
    if (!form.price) { toast.error("Narx kiriting"); return }
    setSaving(true)
    try {
      if (type === 'campaign') {
        await campaignsApi.submitProposal(Number(id), {
          price: Number(form.price),
          expected_result: form.expected_result,
          message: form.message,
        })
      }
      // listing proposal - backend endpoint kerak bo'lsa qo'shiladi
      toast.success("Taklif yuborildi! Egasi ko'rib chiqadi.")
      window.Telegram?.WebApp.HapticFeedback?.impactOccurred('medium')
      navigate(-1)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      toast.error(err?.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-obs-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm">Taklif yuborish</h1>
          {targetTitle && <p className="text-obs-300 text-[10px] truncate">{targetTitle}</p>}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Target info */}
        {target && (
          <div className="p-4 bg-obs-800 border border-obs-700 rounded-2xl">
            <p className="text-obs-300 text-[10px] font-medium uppercase tracking-wide mb-1">
              {type === 'listing' ? "E'lon" : 'Kampaniya'}
            </p>
            <p className="text-white font-semibold text-sm">{targetTitle}</p>
          </div>
        )}

        {/* Price */}
        <div>
          <label className="text-xs text-obs-300 font-medium mb-1.5 block">Narx taklifingiz (so'm) *</label>
          <div className="relative">
            <CurrencyDollar size={18} color="#64748b" className="absolute left-3 top-1/2 -translate-y-1/2" weight="bold" />
            <input className="input pl-10" type="number" placeholder="500000"
              value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>
        </div>

        {/* Expected result */}
        <div>
          <label className="text-xs text-obs-300 font-medium mb-1.5 block">Kutilgan natija</label>
          <div className="relative">
            <ChartLineUp size={18} color="#64748b" className="absolute left-3 top-3.5" weight="bold" />
            <input className="input pl-10" placeholder="Masalan: 5000+ yangi obunachi, 10K reach"
              value={form.expected_result} onChange={e => setForm(f => ({ ...f, expected_result: e.target.value }))} />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-xs text-obs-300 font-medium mb-1.5 block">Xabar</label>
          <div className="relative">
            <ChatText size={18} color="#64748b" className="absolute left-3 top-3.5" weight="bold" />
            <textarea className="input pl-10 resize-none h-28"
              placeholder="O'zingiz haqida, tajribangiz, nima taklif qilasiz..."
              value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>
        </div>

        {/* Info */}
        <div className="p-3 rounded-xl border" style={{ background: 'rgba(13,148,136,0.06)', borderColor: 'rgba(13,148,136,0.15)' }}>
          <p className="text-teal-400 text-xs leading-relaxed">
            💡 Taklif yuborilgach e'lon egasiga bildirishnoma boradi. Agar qabul qilsa, ikkalangiz o'rtasida avtomatik chat ochiladi.
          </p>
        </div>
      </div>

      {/* Fixed submit */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe pt-3 border-t border-obs-700" style={{ background: '#060809' }}>
        <button onClick={handleSubmit} disabled={saving || !form.price}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all"
          style={form.price ? { background: 'linear-gradient(135deg,#0d9488,#0f766e)' } : { background: '#1a2530', color: '#475569' }}>
          {saving
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><PaperPlaneTilt size={18} weight="bold" /> Taklif yuborish</>}
        </button>
      </div>
    </div>
  )
}
