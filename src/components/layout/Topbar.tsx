import { PanelLeftClose, PanelLeftOpen, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

interface TopbarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Topbar({ collapsed, onToggle }: TopbarProps) {
  const user = useAuthStore((s) => s.user)

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'US'

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
        <button className="relative p-1.5 rounded-lg text-text-muted hover:bg-surface-secondary transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <div className="text-sm leading-none">
            <p className="font-medium text-text-primary">{user?.name ?? 'Usuario'}</p>
            <p className="text-text-muted text-xs mt-0.5">{user?.role ?? 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
