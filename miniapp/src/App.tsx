import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Home, Compass, Megaphone, MessageSquare, User, Zap } from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from './store/authStore'
import { authApi } from './utils/api'
import './styles/globals.css'

import MiniHomePage from './pages/MiniHomePage'
import MiniExplorePage from './pages/MiniExplorePage'
import MiniCampaignsPage from './pages/MiniCampaignsPage'
import MiniChatPage from './pages/MiniChatPage'
import MiniProfilePage from './pages/MiniProfilePage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: { user?: Record<string, unknown> }
        isExpanded: boolean
        expand: () => void
        ready: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
        }
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

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-dark-800 pb-safe">
      <div className="flex items-center justify-around px-1 py-1">
        {items.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all',
                'min-w-[52px] min-h-[48px] justify-center',
                active ? 'text-gold-400' : 'text-dark-500'
              )}
              onClick={() =>
                window.Telegram?.WebApp.HapticFeedback?.impactOccurred('light')
              }
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className={clsx('text-[10px] font-medium', active ? 'text-gold-400' : 'text-dark-600')}>
                {label}
              </span>
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

      if (tg.initData && !isAuthenticated) {
        authApi.telegramLogin(tg.initData)
          .then((res) => {
            setAuth(res.data.access_token, res.data.user)
          })
          .catch((err) => {
            console.warn('Auto-login failed:', err)
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    } else {
      // Telegram WebApp yuklanmagan (browser da ochilgan)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center animate-pulse">
            <Zap className="w-7 h-7 text-dark-950" fill="currentColor" />
          </div>
          <span className="font-display text-3xl tracking-widest text-white">MIDAS</span>
          <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-dark-950 pb-20">
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
            fontSize: '14px',
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
