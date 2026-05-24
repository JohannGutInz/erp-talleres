import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  trend?: { value: number; direction: 'up' | 'down' }
  iconColor?: string
}

export function KpiCard({ label, value, sub, icon: Icon, trend, iconColor = 'text-brand' }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary font-medium">{label}</span>
        {Icon && (
          <span className={cn('p-2 rounded-lg bg-brand-light', iconColor)}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trend.direction === 'up' ? 'text-status-completed' : 'text-status-danger')}>
          {trend.direction === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{trend.value}% vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
