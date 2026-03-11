import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Home, Compass, Megaphone, MessageSquare, User, Zap } from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from './store/authStore'
import { authApi } from './utils/api'
import './styles/globals.css'

// Pages
import MiniHomePage from './pages/MiniHomePage'
import MiniExplorePage from './pages/MiniExplorePage'
import MiniCampaignsPage from './pages/MiniCampaignsPage'
import MiniChatPage from './pages/MiniChatPage'
import MiniProfilePage from './pages/MiniProfilePage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

// Telegram WebApp integration
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: Record<string, unknown>
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        isExpanded: boolean
        expand: () => void
        close: () => void
        ready: () => void
        BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void }
        MainButton: { text: string; show: () => void; hide: () => void; onClick: (cb: () => void) => void }
        HapticFeedback: {
          impactOccurred: (style: string) => void
          notificationOccurred: (type: string) => void
        }
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
      }
    }
  }
}

function BottomNav() {
  const location = useLocation()
  const items = [
    { to: '/', icon: Home, label: 'Bosh' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/campaigns', icon: Megaphone, label: 'Kampaniya' },
    { to: '/messages', icon: MessageSquare, label: 'Xabar' },
    { to: '/profile', icon: User, label: 'Profil' },
  ]

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-dark-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all min-w-[52px]',
                active ? 'text-gold-400' : 'text-dark-500'
              )}
              onClick={() => window.Telegram?.WebApp.HapticFeedback?.impactOccurred('light')}
            >
              <div className={clsx(
                'w-6 h-6 flex items-center justify-center',
                active && 'scale-110'
              )}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={clsx('text-[10px] font-medium', active ? 'text-gold-400' : 'text-dark-600')}>
                {label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-gold-400 absolute bottom-1" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function AppInner() {
  const { setAuth, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.expand()
      tg.ready()
      tg.setBackgroundColor('#0a0a0a')
      tg.setHeaderColor('#0a0a0a')

      // Auto-login
      if (tg.initData && !isAuthenticated) {
        authApi.telegramLogin(tg.initData)
          .then((res) => {
            setAuth(res.data.access_token, res.data.user)
          })
          .catch(() => {})
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center animate-pulse">
            <Zap className="w-7 h-7 text-dark-950" fill="currentColor" />
          </div>
          <span className="font-display text-3xl tracking-widest text-white">MIDAS</span>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-950 pb-20">
        <Routes>
          <Route path="/" element={<MiniHomePage />} />
          <Route path="/explore" element={<MiniExplorePage />} />
          <Route path="/campaigns" element={<MiniCampaignsPage />} />
          <Route path="/messages" element={<MiniChatPage />} />
          <Route path="/profile" element={<MiniProfilePage />} />
        </Routes>
        <BottomNav />
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#f5f5f5',
            border: '1px solid #262626',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
