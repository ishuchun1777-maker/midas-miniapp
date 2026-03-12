import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChartLineUp, Eye, Users, TrendingUp } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { listingsApi, dealsApi } from '../utils/api'

export default function AnalyticsPage() {
  const navigate = useNavigate()

  const { data: myListings } = useQuery({
    queryKey: ['my-listings-analytics'],
    queryFn: () => listingsApi.list({ per_page: 50 }).then(r => r.data),
  })

  const { data: deals } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list().then(r => r.data),
  })

  const totalViews = myListings?.items?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0
  const totalSaves = myListings?.items?.reduce((sum, l) => sum + (l.save_count || 0), 0) || 0
  const totalLeads = myListings?.items?.reduce((sum, l) => sum + (l.lead_count || 0), 0) || 0
  const completedDeals = deals?.filter(d => d.status === 'completed').length || 0

  const stats = [
    { label: "Ko'rishlar", value: totalViews, icon: Eye, color: '#2dd4bf' },
    { label: 'Saqlangan', value: totalSaves, icon: Users, color: '#c8a84b' },
    { label: 'Murojaat', value: totalLeads, icon: TrendingUp, color: '#0d9488' },
    { label: 'Bitim', value: completedDeals, icon: ChartLineUp, color: '#c8a84b' },
  ]

  return (
    <div className="min-h-screen bg-obs-900">
      <div className="sticky top-0 z-20 glass border-b border-obs-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-obs-800 flex items-center justify-center active:scale-90">
          <ArrowLeft size={18} color="#94a3b8" weight="bold" />
        </button>
        <h1 className="text-white font-bold text-base">Tahlil</h1>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-obs-800 border border-obs-700 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
                <Icon size={20} color={color} weight="bold" />
              </div>
              <div className="font-bold text-2xl text-white mb-0.5">{value}</div>
              <div className="text-obs-400 text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>

        {myListings?.items && myListings.items.length > 0 && (
          <div>
            <p className="text-obs-400 text-xs font-bold uppercase tracking-widest mb-3">E'lonlar statistikasi</p>
            <div className="space-y-3">
              {myListings.items.map(l => (
                <div key={l.id} className="bg-obs-800 border border-obs-700 rounded-2xl p-4">
                  <p className="text-white font-semibold text-sm truncate mb-3">{l.title}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Ko'rish", val: l.view_count, color: '#2dd4bf' },
                      { label: 'Saqlash', val: l.save_count, color: '#c8a84b' },
                      { label: 'Murojaat', val: l.lead_count, color: '#0d9488' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="text-center p-2 bg-obs-700 rounded-xl">
                        <div className="font-bold text-sm" style={{ color }}>{val || 0}</div>
                        <div className="text-[10px] text-obs-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!myListings?.items || myListings.items.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-obs-800 flex items-center justify-center mb-4">
              <ChartLineUp size={32} color="#334155" weight="duotone" />
            </div>
            <p className="text-obs-300 font-medium">Hali e'lonlar yo'q</p>
            <p className="text-obs-400 text-sm mt-1">E'lon yaratgach statistika bu yerda ko'rinadi</p>
            <button onClick={() => navigate('/listing/create')} className="btn-primary mt-4 text-sm">
              E'lon yaratish
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
