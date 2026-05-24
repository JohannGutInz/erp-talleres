import { cn } from '@/lib/utils'

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  Completada:    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'En progreso': { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  Pendiente:     { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  Cancelada:     { bg: 'bg-violet-100',  text: 'text-violet-700'  },
  Programada:    { bg: 'bg-sky-100',     text: 'text-sky-700'     },
  Confirmada:    { bg: 'bg-indigo-100',  text: 'text-indigo-700'  },
  Borrador:      { bg: 'bg-slate-100',   text: 'text-slate-600'   },
  Timbrada:      { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Enviada:       { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  Recibida:      { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_MAP[status] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', style.bg, style.text)}>
      {status}
    </span>
  )
}
