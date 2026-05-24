import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon:          LucideIcon
  title:         string
  subtitle?:     string
  badge?:        React.ReactNode
  collapsible?:  boolean
  defaultOpen?:  boolean
  children:      React.ReactNode
}

export function FormSection({ icon: Icon, title, subtitle, badge, collapsible = false, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-surface-border bg-white shadow-sm overflow-visible">
      <div
        className={`flex items-center gap-4 px-6 py-4 ${collapsible ? 'cursor-pointer select-none hover:bg-surface-secondary/40 transition-colors rounded-2xl' : ''}`}
        onClick={() => collapsible && setOpen((v) => !v)}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/8 ring-1 ring-brand/12">
          <Icon size={16} className="text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
        {collapsible && (
          <ChevronDown size={15} className={`shrink-0 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        )}
      </div>
      {(!collapsible || open) && (
        <div className="px-6 pb-6 pt-1 border-t border-surface-border/60">
          {children}
        </div>
      )}
    </div>
  )
}
