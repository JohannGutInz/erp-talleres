import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SectionCardProps {
  number: number
  title: string
  subtitle?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function SectionCard({ number, title, subtitle, children, collapsible = false, defaultCollapsed = false }: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed)

  return (
    <div id={`section-${number}`} className="rounded-xl border border-surface-border bg-white shadow-sm">
      <div
        className={`flex items-center gap-3 px-6 py-4 border-b border-surface-border bg-surface-secondary rounded-t-xl ${collapsible ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''}`}
        onClick={() => collapsible && setIsOpen((v) => !v)}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">
          {number}
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
        </div>
        {collapsible && (
          <ChevronDown
            size={16}
            className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </div>
      {(!collapsible || isOpen) && <div className="p-6">{children}</div>}
    </div>
  )
}
