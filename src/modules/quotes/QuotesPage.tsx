import { useState, useEffect } from 'react'
import { Plus, FileText, ChevronDown, Car, User, DollarSign, Calendar, Trash2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { QuoteFormValues } from '@/types/quote.types'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface StoredQuote {
  quoteNumber: string
  data: QuoteFormValues
  timestamp: string
}

const STATUS_FILTER_OPTIONS = ['Todos', 'Pendiente', 'Enviada', 'Aprobada', 'Rechazada', 'En proceso', 'Concluida']

function calcTotal(data: QuoteFormValues) {
  const subtotal =
    data.laborItems.reduce((s, l) => s + (l.hours || 0) * (l.unitPrice || 0), 0) +
    data.partItems.reduce((s, p) => s + (p.quantity || 0) * (p.unitPrice || 0), 0)
  const disc = subtotal * ((data.discount || 0) / 100)
  return (subtotal - disc) * 1.16
}

function QuoteRow({ quote, onDelete }: { quote: StoredQuote; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const { data, quoteNumber, timestamp } = quote
  const total = calcTotal(data)
  const date = new Date(timestamp).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="border border-surface-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* ── Summary row ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/50 transition-colors text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
          <FileText size={15} className="text-brand" />
        </div>

        <div className="min-w-0 flex-1 grid grid-cols-4 gap-4 items-center">
          <div className="min-w-0">
            <p className="text-xs text-text-muted">{quoteNumber}</p>
            <p className="text-sm font-semibold text-text-primary truncate">{data.clientName || '—'}</p>
            <p className="text-xs text-text-muted">{data.clientPhone}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Vehículo</p>
            <p className="text-sm font-medium text-text-primary truncate">
              {[data.vehicleBrand, data.vehicleModel, data.vehicleYear].filter(Boolean).join(' ') || '—'}
            </p>
            <p className="text-xs text-text-muted">{data.vehiclePlate || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-sm font-bold text-text-primary">{formatCurrency(total)}</p>
            <p className="text-xs text-text-muted">
              {data.laborItems.length} serv. · {data.partItems.length} refac.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={data.quoteStatus} />
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Calendar size={10} /> {date}
            </p>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Expanded detail ── */}
      {open && (
        <div className="border-t border-surface-border bg-surface-secondary/30 px-5 py-4 space-y-4">
          {/* Client + Vehicle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-surface-border bg-white p-4 space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                <User size={11} /> Cliente
              </p>
              {[
                { label: 'Nombre', value: data.clientName },
                { label: 'Teléfono', value: data.clientPhone },
                data.clientEmail ? { label: 'Correo', value: data.clientEmail } : null,
                data.clientRfc ? { label: 'RFC', value: data.clientRfc } : null,
                data.clientCompany ? { label: 'Empresa', value: data.clientCompany } : null,
              ].filter(Boolean).map((row) => row && (
                <div key={row.label} className="flex gap-2 text-xs">
                  <span className="text-text-muted w-16 shrink-0">{row.label}</span>
                  <span className="text-text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-surface-border bg-white p-4 space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                <Car size={11} /> Vehículo
              </p>
              {[
                { label: 'Marca', value: [data.vehicleBrand, data.vehicleModel].filter(Boolean).join(' ') },
                { label: 'Año', value: data.vehicleYear ? String(data.vehicleYear) : undefined },
                { label: 'Placas', value: data.vehiclePlate },
                data.vehicleVin ? { label: 'VIN', value: data.vehicleVin } : null,
                data.vehicleColor ? { label: 'Color', value: data.vehicleColor } : null,
                data.vehicleEngine ? { label: 'Motor', value: data.vehicleEngine } : null,
              ].filter(Boolean).map((row) => row && row.value && (
                <div key={row.label} className="flex gap-2 text-xs">
                  <span className="text-text-muted w-16 shrink-0">{row.label}</span>
                  <span className="text-text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Problem */}
          {data.problemDescription && (
            <div className="rounded-lg border border-surface-border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Problema</p>
              <p className="text-sm text-text-primary">{data.problemDescription}</p>
            </div>
          )}

          {/* Labor + Parts */}
          {(data.laborItems.length > 0 || data.partItems.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {data.laborItems.length > 0 && (
                <div className="rounded-lg border border-surface-border bg-white overflow-hidden">
                  <div className="bg-surface-secondary px-4 py-2 border-b border-surface-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Mano de obra</p>
                  </div>
                  <table className="w-full">
                    <tbody>
                      {data.laborItems.map((item, i) => (
                        <tr key={i} className="border-b border-surface-border last:border-0">
                          <td className="px-4 py-2 text-xs text-text-primary">{item.service}</td>
                          <td className="px-4 py-2 text-xs font-semibold text-text-primary text-right">
                            {formatCurrency(item.hours * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {data.partItems.length > 0 && (
                <div className="rounded-lg border border-surface-border bg-white overflow-hidden">
                  <div className="bg-surface-secondary px-4 py-2 border-b border-surface-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Refacciones</p>
                  </div>
                  <table className="w-full">
                    <tbody>
                      {data.partItems.map((item, i) => (
                        <tr key={i} className="border-b border-surface-border last:border-0">
                          <td className="px-4 py-2 text-xs text-text-primary">{item.name}</td>
                          <td className="px-4 py-2 text-xs text-text-muted text-center">×{item.quantity}</td>
                          <td className="px-4 py-2 text-xs font-semibold text-text-primary text-right">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Totals + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-white px-4 py-3">
              <DollarSign size={14} className="text-status-completed" />
              <div>
                <p className="text-xs text-text-muted">Total c/IVA</p>
                <p className="text-base font-bold text-text-primary">{formatCurrency(total)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuotesPage() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<StoredQuote[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem('quotes_list')
        setQuotes(raw ? JSON.parse(raw) : [])
      } catch { setQuotes([]) }
    }
    load()
    window.addEventListener('quote:submitted', load)
    return () => window.removeEventListener('quote:submitted', load)
  }, [])

  function handleDelete(quoteNumber: string) {
    const updated = quotes.filter((q) => q.quoteNumber !== quoteNumber)
    localStorage.setItem('quotes_list', JSON.stringify(updated))
    setQuotes(updated)
  }

  const filtered = quotes.filter((q) => {
    const matchStatus = statusFilter === 'Todos' || q.data.quoteStatus === statusFilter
    const term = search.toLowerCase()
    const matchSearch =
      !term ||
      q.data.clientName?.toLowerCase().includes(term) ||
      q.data.clientPhone?.includes(term) ||
      q.quoteNumber.toLowerCase().includes(term) ||
      q.data.vehiclePlate?.toLowerCase().includes(term) ||
      [q.data.vehicleBrand, q.data.vehicleModel].join(' ').toLowerCase().includes(term)
    return matchStatus && matchSearch
  })

  const kpis = [
    { label: 'Total', value: quotes.length, color: 'text-text-primary' },
    { label: 'Pendientes', value: quotes.filter((q) => q.data.quoteStatus === 'Pendiente').length, color: 'text-amber-600' },
    { label: 'Aprobadas', value: quotes.filter((q) => q.data.quoteStatus === 'Aprobada').length, color: 'text-status-completed' },
    { label: 'Monto total', value: formatCurrency(quotes.reduce((s, q) => s + calcTotal(q.data), 0)), color: 'text-brand' },
  ]

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        description="Cotizaciones enviadas a clientes"
        actions={
          <button
            onClick={() => navigate('/quotes/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nuevo Presupuesto
          </button>
        }
      />

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-surface-border bg-white p-4 shadow-sm">
            <p className="text-xs text-text-muted mb-1">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, placa, folio…"
            className="w-full rounded-lg border border-surface-border pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTER_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-brand text-white'
                  : 'border border-surface-border bg-white text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
            {quotes.length === 0
              ? <EmptyState icon={FileText} message="No hay presupuestos" description="Crea el primer presupuesto para un cliente" />
              : <EmptyState icon={Search} message="Sin resultados" description="Intenta con otro término o filtro" />
            }
          </div>
        ) : (
          filtered.map((q) => (
            <QuoteRow key={q.quoteNumber} quote={q} onDelete={() => handleDelete(q.quoteNumber)} />
          ))
        )}
      </div>
    </div>
  )
}
