import type { LucideIcon } from 'lucide-react'
import { FileSearch } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  message?: string
  description?: string
}

export function EmptyState({ icon: Icon = FileSearch, message = 'Sin resultados', description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} className="text-text-muted mb-3" />
      <p className="text-sm font-medium text-text-secondary">{message}</p>
      {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
    </div>
  )
}
