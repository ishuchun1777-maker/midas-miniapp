import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
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

// Ro'yxatdan o'tmagan foydalanuvchini himoya qiluvchi wrapper
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
          <Zap className="w-7 h-7 text-gold-400" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Kirish talab etiladi</h2>
        <p className="text-dark-400 text-sm mb-5">
          Bu bo'limdan foydalanish uchun avval ro'yxatdan o'ting
        </p>
        <button
          onClick={() => {
            const tg = window.Telegram?.WebApp
            if (tg?.initData) {
              toast.loading("Kirilmoqda...")
              authApi.telegramLogin(tg.initData)
                .then((res) => {
                  useAuthStore.getState().setAuth(res.data.access_token, res.data.user)
                  toast.dismiss()
                  toast.success("Muvaffaqiyatli kirildi!")
                })
                .catch(() => {
                  toast.dismiss()
                  toast.error("Xatolik yuz berdi")
                })
            } else {
              toast.error("Telegram orqali oching")
            }
          }}
          className="btn-primary w-full max-w-xs"
        >
          Telegram orqali kirish
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-3 text-dark-400 text-sm underline"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    )
  }

  return <>{children}</>
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

function AppRoutes() {
  return (
    <>
      <div className="w-full min-h-screen bg-dark-950 pb-20">
        <Routes>
          <Route path="/" element={<MiniHomePage />} />
          <Route path="/explore" element={<MiniExplorePage />} />
          <Route path="/campaigns" element={<MiniCampaignsPage />} />
          <Route path="/messages" element={<AuthGuard><MiniChatPage /></AuthGuard>} />
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
    </>
  )
}

function AppInner() {
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (tg) {
      tg.expand()
      tg.ready()
      tg.setBackgroundColor('#0a0a0a')
      tg.setHeaderColor('#0a0a0a')

      if (tg.initData) {
        authApi.telegramLogin(tg.initData)
          .then((res) => {
            setAuth(res.data.access_token, res.data.user)
            setAuthError(false)
          })
          .catch((err) => {
            console.warn('Auto-login failed:', err)
            setAuthError(true)
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
        setAuthError(true)
      }
    } else {
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

  if (authError && !window.Telegram?.WebApp?.initData) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold-500 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-dark-950" fill="currentColor" />
          </div>
          <h1 className="font-display text-3xl text-white mb-2">MIDAS</h1>
          <p className="text-dark-400 text-sm">
            Telegram botdan oching
          </p>
        </div>
      </div>
    )
  }

  return <AppRoutes />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppInner />
      </HashRouter>
    </QueryClientProvider>
  )
}
