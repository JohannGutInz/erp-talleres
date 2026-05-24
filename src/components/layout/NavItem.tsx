import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  to: string
  icon: LucideIcon
  label: string
  collapsed?: boolean
}

export function NavItem({ to, icon: Icon, label, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-light text-brand'
            : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
        )
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? 'text-brand' : 'text-text-secondary'} />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  )
}
