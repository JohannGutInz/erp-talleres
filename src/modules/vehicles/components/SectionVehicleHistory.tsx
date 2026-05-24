import { useMemo } from 'react'
import { History, FileText, DollarSign, Calendar, Clock } from 'lucide-react'
import type { QuoteFormValues } from '@/types/quote.types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface StoredQuote {
  quoteNumber: string
  data: QuoteFormValues
  timestamp: string
}

function loadQuotes(): StoredQuote[] {
  try { return JSON.parse(localStorage.getItem('quotes_list') ?? '[]') } catch { return [] }
}

function calcTotal(data: QuoteFormValues) {
  const sub = data.laborItems.reduce((s, l) => s + l.hours * l.unitPrice, 0) +
    data.partItems.reduce((s, p) => s + p.quantity * p.unitPrice, 0)
  return (sub - sub * ((data.discount || 0) / 100)) * 1.16
}

interface Props {
  plate?: string
  clientId?: string
}

export function SectionVehicleHistory({ plate, clientId }: Props) {
  const related = useMemo(() => {
    if (!plate && !clientId) return []
    return loadQuotes().filter((q) =>
      (plate && q.data.vehiclePlate?.toUpperCase() === plate?.toUpperCase()) ||
      (clientId && q.data.clientPhone)
    )
  }, [plate, clientId])

  const totalSpent = related.reduce((s, q) => s + calcTotal(q.data), 0)
  const lastVisit = related[0]?.timestamp
  const lastService = related[0]?.data.laborItems[0]?.service

  return (
    <div className="rounded-2xl border border-surface-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-border/60">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/8 ring-1 ring-brand/12">
          <History size={15} className="text-brand" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Historial</h3>
          <p className="text-xs text-text-muted">{related.length} visita{related.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {related.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 px-5 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
            <Clock size={18} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">Sin historial previo</p>
          <p className="text-xs text-text-muted">Las visitas aparecerán aquí</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* KPI mini strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-secondary/50 p-3">
              <p className="text-xs text-text-muted mb-0.5">Gasto acumulado</p>
              <p className="text-base font-bold text-text-primary">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="rounded-xl bg-surface-secondary/50 p-3">
              <p className="text-xs text-text-muted mb-0.5">Visitas totales</p>
              <p className="text-base font-bold text-text-primary">{related.length}</p>
            </div>
          </div>

          {lastVisit && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Calendar size={12} />
              <span>Última visita: {formatDate(lastVisit)}</span>
            </div>
          )}
          {lastService && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <FileText size={12} />
              <span className="truncate">Último servicio: {lastService}</span>
            </div>
          )}

          {/* Recent quotes */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Presupuestos recientes</p>
            {related.slice(0, 4).map((q) => (
              <div key={q.quoteNumber} className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-secondary/30 px-3 py-2">
                <DollarSign size={12} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{q.quoteNumber}</p>
                  <p className="text-xs text-text-muted">{formatCurrency(calcTotal(q.data))}</p>
                </div>
                <StatusBadge status={q.data.quoteStatus} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
