import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import LoginPage from '@/modules/auth/LoginPage'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <LoginPage />
}
