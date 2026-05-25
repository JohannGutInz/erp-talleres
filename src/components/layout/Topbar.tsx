import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, Bell, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

interface TopbarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Topbar({ collapsed, onToggle }: TopbarProps) {
  const user     = useAuthStore((s) => s.user)
  const logout   = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'US'

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="h-14 border-b border-surface-border bg-white flex items-center justify-between px-4 shrink-0">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg text-text-muted hover:bg-surface-secondary transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full" />
        </button>

        {/* Avatar + dropdown */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="text-sm leading-none text-left">
              <p className="font-medium text-text-primary">{user?.name ?? 'Usuario'}</p>
              <p className="text-text-muted text-xs mt-0.5">{user?.role ?? 'Admin'}</p>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-surface-border bg-white shadow-lg py-1 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-surface-border">
                <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                <p className="text-xs text-text-muted">{user?.companyName}</p>
              </div>

              {/* Profile (placeholder) */}
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                <User size={14} /> Mi perfil
              </button>

              {/* Logout */}
              <div className="border-t border-surface-border mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
