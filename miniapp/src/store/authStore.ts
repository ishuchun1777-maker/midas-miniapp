import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  telegram_id: number
  telegram_username?: string
  first_name: string
  last_name?: string
  photo_url?: string
  language_code: string
  is_verified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        localStorage.setItem('midas_token', token)
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('midas_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'midas-mini-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
)
