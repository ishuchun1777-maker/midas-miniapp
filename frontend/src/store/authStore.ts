import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserProfile } from '@/utils/api'

interface AuthState {
  user: User | null
  profiles: UserProfile[]
  token: string | null
  isAuthenticated: boolean
  language: 'uz' | 'ru' | 'en'
  setAuth: (token: string, user: User) => void
  setProfiles: (profiles: UserProfile[]) => void
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profiles: [],
      token: null,
      isAuthenticated: false,
      language: 'uz',

      setAuth: (token, user) => {
        localStorage.setItem('midas_token', token)
        set({ token, user, isAuthenticated: true })
      },

      setProfiles: (profiles) => set({ profiles }),

      setLanguage: (language) => set({ language }),

      logout: () => {
        localStorage.removeItem('midas_token')
        set({ user: null, profiles: [], token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'midas-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        language: state.language,
      }),
    }
  )
)
