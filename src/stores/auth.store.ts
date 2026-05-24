import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'mechanic' | 'receptionist'
  companyId: string
  companyName: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('company_id', user.companyId)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('company_id')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'erp-auth' }
  )
)
