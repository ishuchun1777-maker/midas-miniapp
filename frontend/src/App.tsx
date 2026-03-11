import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import '../i18n'
import { Layout } from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import ExplorePage from '@/pages/ExplorePage'
import CampaignsPage from '@/pages/CampaignsPage'
import ChatPage from '@/pages/ChatPage'
import LoginPage from '@/pages/LoginPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center animate-pulse">
          <span className="font-display text-dark-950 text-lg">M</span>
        </div>
        <div className="text-dark-400 text-sm">Yuklanmoqda...</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/messages" element={<ChatPage />} />
              <Route path="/deals" element={<DealsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
