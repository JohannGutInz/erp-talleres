import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, X, ClipboardList, Clock, CheckCircle2,
  AlertCircle, Wrench, Pencil, ChevronRight, FileText,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/order.types'
import { ORDER_STATUSES } from '@/lib/constants'

// ── Helpers ───────────────────────────────────────────────────────────────

function loadOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem('orders_list') ?? '[]') } catch { return [] }
}

function saveOrders(list: Order[]) {
  localStorage.setItem('orders_list', JSON.stringify(list))
}

// ── Status chip styles ────────────────────────────────────────────────────

const STATUS_CHIP: Record<OrderStatus, string> = {
  'Pendiente':   'border-amber-200  bg-amber-50  text-amber-700',
  'En progreso': 'border-blue-200   bg-blue-50   text-blue-700',
  'Completada':  'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Cancelada':   'border-violet-200 bg-violet-50 text-violet-700',
}

// ── Inline status selector ────────────────────────────────────────────────

function StatusSelect({ order, onUpdate }: { order: Order; onUpdate: (id: string, s: OrderStatus) => void }) {
  return (
    <select
      value={order.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => { e.stopPropagation(); onUpdate(order.id, e.target.value as OrderStatus) }}
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/25 transition-colors ${STATUS_CHIP[order.status]}`}
    >
      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders]           = useState<Order[]>(loadOrders)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  // Refresh on events
  useEffect(() => {
    const refresh = () => setOrders(loadOrders())
    window.addEventListener('order:created', refresh)
    window.addEventListener('order:updated', refresh)
    return () => {
      window.removeEventListener('order:created', refresh)
      window.removeEventListener('order:updated', refresh)
    }
  }, [])

  // Inline status change
  function handleStatusChange(id: string, newStatus: OrderStatus) {
    const updated = orders.map((o) =>
      o.id === id ? {
        ...o,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'Completada' ? { completedAt: new Date().toISOString() } : {}),
      } : o
    )
    saveOrders(updated)
    setOrders(updated)
    window.dispatchEvent(new CustomEvent('order:updated', { detail: { id } }))
  }

  // Filter
  const filtered = orders.filter((o) => {
    const matchStatus = !statusFilter || o.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || [o.number, o.clientName, o.vehiclePlate, o.vehicleModel, o.technicianName ?? '']
      .some((v) => v.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  // KPIs
  const pendientes  = orders.filter((o) => o.status === 'Pendiente').length
  const enProgreso  = orders.filter((o) => o.status === 'En progreso').length
  const completadas = orders.filter((o) => o.status === 'Completada').length
  const ingresos    = orders.filter((o) => o.status === 'Completada').reduce((s, o) => s + o.total, 0)

  const kpis = [
    { label: 'Total órdenes',  value: orders.length,         color: 'text-text-primary',     icon: ClipboardList },
    { label: 'Pendientes',     value: pendientes,            color: 'text-amber-600',         icon: Clock         },
    { label: 'En progreso',    value: enProgreso,            color: 'text-blue-600',          icon: Wrench        },
    { label: 'Completadas',    value: completadas,           color: 'text-status-completed',  icon: CheckCircle2  },
    { label: 'Ingresos',       value: formatCurrency(ingresos), color: 'text-brand',          icon: AlertCircle   },
  ]

  return (
    <div>
      <PageHeader
        title="Órdenes de Trabajo"
        description="Gestión de diagnósticos, servicios y reparaciones"
        actions={
          <button onClick={() => navigate('/orders/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Nueva Orden
          </button>
        }
      />

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-5 gap-4">
        {kpis.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-surface-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">{label}</p>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="No. orden, cliente, placa, técnico…"
            className="w-full rounded-lg border border-surface-border pl-9 pr-9 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X size={13} /></button>}
        </div>

        <div className="flex items-center gap-2">
          {(['', ...ORDER_STATUSES] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-brand text-white'
                  : 'border border-surface-border bg-white text-text-secondary hover:bg-surface-secondary'
              }`}>
              {s || 'Todos'}
            </button>
          ))}
        </div>

        {statusFilter && (
          <button onClick={() => setStatusFilter('')}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary">
            <X size={12} /> Limpiar filtro
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-4 rounded-xl border border-surface-border bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8">
            {orders.length === 0
              ? <EmptyState icon={ClipboardList} message="Sin órdenes de trabajo" description="Crea una nueva orden o convierte un presupuesto aprobado" />
              : <EmptyState icon={Search} message="Sin resultados" description="Intenta con otro término o filtro" />
            }
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary border-b border-surface-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">No. Orden</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Vehículo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Técnico</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Estatus</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Fecha</th>
                <th className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map((order) => (
                <tr key={order.id}
                  onClick={() => navigate(`/orders/${order.id}/edit`)}
                  className="hover:bg-surface-secondary/50 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-brand">{order.number}</span>
                      {order.sourceQuoteNumber && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                          <FileText size={9} /> COT
                        </span>
                      )}
                    </div>
                    {order.sourceQuoteNumber && (
                      <p className="text-[10px] text-text-muted font-mono mt-0.5">{order.sourceQuoteNumber}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{order.clientName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-text-primary">{order.vehicleModel}</p>
                    <p className="font-mono text-xs text-text-muted">{order.vehiclePlate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className={order.technicianName ? 'text-text-primary' : 'text-text-muted'}>
                      {order.technicianName || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect order={order} onUpdate={handleStatusChange} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-text-primary">{formatCurrency(order.total)}</span>
                    {(order.services.length > 0 || order.parts.length > 0) && (
                      <p className="text-[10px] text-text-muted">
                        {order.services.length > 0 && `${order.services.length} serv.`}
                        {order.services.length > 0 && order.parts.length > 0 && ' · '}
                        {order.parts.length > 0 && `${order.parts.length} refac.`}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-3 py-3">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}/edit`) }}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-surface-secondary hover:text-brand transition-colors">
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="mt-3 text-xs text-text-muted text-right">
          {filtered.length} {filtered.length === 1 ? 'orden' : 'órdenes'} · haz clic en una fila para editar
        </p>
      )}
    </div>
  )
}
