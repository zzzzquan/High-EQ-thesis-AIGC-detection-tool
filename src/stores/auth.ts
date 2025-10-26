import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'premium'
  usageCount: number
  maxUsage: number
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUsage: (count: number) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (user: User, token: string) => {
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  updateUsage: (count: number) => {
    set((state) => ({
      user: state.user ? { ...state.user, usageCount: count } : null
    }))
  }
}))