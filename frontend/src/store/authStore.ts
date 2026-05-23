import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: (user, token, refreshToken) => {
        localStorage.setItem('refreshToken', refreshToken)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'techlearn-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
