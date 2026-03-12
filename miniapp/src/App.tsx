import { useEffect, useState, useRef } from 'react'
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import { House, Compass, Megaphone, ChatCircle, User, Lightning } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useAuthStore } from './store/authStore'
import { authApi } from './utils/api'
import './styles/globals.css'

// Pages
import MiniHomePage        from './pages/MiniHomePage'
import MiniExplorePage     from './pages/MiniExplorePage'
import MiniCampaignsPage   from './pages/MiniCampaignsPage'
import MiniChatPage        from './pages/MiniChatPage'
import MiniProfilePage     from './pages/MiniProfilePage'
import WelcomePage         from './pages/WelcomePage'
import OnboardingPage      from './pages/OnboardingPage'
import CreateListingPage   from './pages/CreateListingPage'
import ListingDetailPage   from './pages/ListingDetailPage'
import CampaignDetailPage  from './pages/CampaignDetailPage'
import ProposalPage        from './pages/ProposalPage'
import NotificationsPage   from './pages/NotificationsPage'
import DealsPage           from './pages/DealsPage'
import UserProfilePage     from './pages/UserProfilePage'
import FavoritesPage       from './pages/FavoritesPage'

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
        HapticFeedback?: { impactOccurred: (style: 'light' | 'medium' | 'heavy') => void }
      }
    }
  }
}

// ── Auth Guard ──────────────────────────────────────────────────────────────
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)' }}>
          <Lightning size={28} color="#0d9488" weight="fill" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Kirish talab etiladi</h2>
        <p className="text-obs-300 text-sm mb-6 leading-relaxed">
          Bu bo'limdan foydalanish uchun avval ro'yxatdan o'ting
        </p>
        <button
          onClick={() => {
            const tg = window.Telegram?.WebApp
            if (tg?.initData) {
              const t = toast.loading('Kirilmoqda...')
              authApi.telegramLogin(tg.initData)
                .then(res => {
                  useAuthStore.getState().setAuth(res.data.access_token, res.data.user)
                  toast.dismiss(t)
                  toast.success('Muvaffaqiyatli kirildi!')
                })
                .catch(() => { toast.dismiss(t); toast.error('Xatolik yuz berdi') })
            } else {
              toast.error('Telegram orqali oching')
            }
          }}
          className="w-full max-w-xs py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 mb-3"
          style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
          Telegram orqali kirish
        </button>
        <button onClick={() => navigate('/')} className="text-obs-400 text-sm py-2">
          Bosh sahifaga qaytish
        </button>
      </div>
    )
  }
  return <>{children}</>
}

// ── Bottom Nav ──────────────────────────────────────────────────────────────
function BottomNav() {
  const location = useLocation()

  const items = [
    { to: '/',          icon: House,      label: 'Bosh'     },
    { to: '/explore',   icon: Compass,    label: 'Bozor'    },
    { to: '/campaigns', icon: Megaphone,  label: 'Kampaniya'},
    { to: '/messages',  icon: ChatCircle, label: 'Chat'     },
    { to: '/profile',   icon: User,       label: 'Profil'   },
  ]

  // Ichki sahifalarda nav ko'rsatmaymiz
  const hideNavPaths = ['/listing/create', '/proposal', '/notifications', '/deals', '/favorites', '/user', '/campaign/']
  const shouldHide = hideNavPaths.some(p => location.pathname.startsWith(p))
  if (shouldHide) return null

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-obs-700 pb-safe">
      <div className="flex items-center justify-around px-1 py-1">
        {items.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to}
              className={clsx(
                'flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all min-w-[52px] min-h-[48px] justify-center',
                active ? '' : 'text-obs-500'
              )}
              onClick={() => window.Telegram?.WebApp.HapticFeedback?.impactOccurred('light')}
              style={active ? { color: '#2dd4bf' } : {}}>
              <Icon size={22} weight={active ? 'fill' : 'regular'} />
              <span className={clsx('text-[10px] font-semibold', active ? '' : 'text-obs-500')}
                style={active ? { color: '#2dd4bf' } : {}}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#060809' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)', boxShadow: '0 12px 32px rgba(13,148,136,0.4)' }}>
          <Lightning size={32} color="#fff" weight="fill" />
        </div>
        <span className="font-display text-4xl tracking-widest midas-gradient">MIDAS</span>
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mt-2" />
      </div>
    </div>
  )
}

// ── App Inner ────────────────────────────────────────────────────────────────
function AppInner() {
  const { setAuth, isAuthenticated } = useAuthStore()
  const [loading, setLoading]               = useState(true)
  const [showWelcome, setShowWelcome]       = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const authCalled = useRef(false)

  useEffect(() => {
    if (authCalled.current) return
    authCalled.current = true

    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.expand()
      tg.ready()
      tg.setBackgroundColor('#060809')
      tg.setHeaderColor('#060809')

      if (tg.initData && !isAuthenticated) {
        authApi.telegramLogin(tg.initData)
          .then(res => {
            setAuth(res.data.access_token, res.data.user)
            if (res.data.is_new_user) {
              setShowWelcome(true)   // avval WelcomePage ko'rsatamiz
            }
          })
          .catch(err => console.warn('Auth failed:', err))
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    } else {
      // Dev mode — Telegram bo'lmasa ham ishlaydi
      setLoading(false)
    }
  }, [])

  if (loading) return <LoadingScreen />

  // Yangi foydalanuvchi — Welcome screen
  if (showWelcome) {
    return (
      <WelcomePage onEnter={() => {
        setShowWelcome(false)
        setShowOnboarding(true)
      }} />
    )
  }

  // Onboarding
  if (showOnboarding && isAuthenticated) {
    return <OnboardingPage onDone={() => setShowOnboarding(false)} />
  }

  return (
    <div className="w-full min-h-screen pb-20" style={{ background: '#060809' }}>
      <Routes>
        {/* Public — login kerak emas */}
        <Route path="/"                        element={<MiniHomePage />} />
        <Route path="/explore"                 element={<MiniExplorePage />} />
        <Route path="/listing/:id"             element={<ListingDetailPage />} />
        <Route path="/campaign/:id"            element={<CampaignDetailPage />} />
        <Route path="/user/:id"                element={<UserProfilePage />} />

        {/* Auth required */}
        <Route path="/campaigns"               element={<AuthGuard><MiniCampaignsPage /></AuthGuard>} />
        <Route path="/messages"                element={<AuthGuard><MiniChatPage /></AuthGuard>} />
        <Route path="/profile"                 element={<MiniProfilePage />} />
        <Route path="/listing/create"          element={<AuthGuard><CreateListingPage /></AuthGuard>} />
        <Route path="/notifications"           element={<AuthGuard><NotificationsPage /></AuthGuard>} />
        <Route path="/deals"                   element={<AuthGuard><DealsPage /></AuthGuard>} />
        <Route path="/favorites"               element={<AuthGuard><FavoritesPage /></AuthGuard>} />
        <Route path="/proposal/listing/:id"    element={<AuthGuard><ProposalPage type="listing" /></AuthGuard>} />
        <Route path="/proposal/campaign/:id"   element={<AuthGuard><ProposalPage type="campaign" /></AuthGuard>} />
      </Routes>

      <BottomNav />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0f1419',
            color: '#f1f5f9',
            border: '1px solid #1a2530',
            borderRadius: '14px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  )
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
