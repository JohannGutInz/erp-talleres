import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ShoppingCart, Pencil, Trash2, CheckCircle, Send, PackageCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseOrder, PurchaseOrderStatus, StockMovement } from '@/types/inventory.types'

function loadPOs(): PurchaseOrder[] {
  try { return JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]') } catch { return [] }
}

const STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; bg: string; text: string }> = {
  'Borrador':              { label: 'Borrador',              bg: 'bg-slate-100',    text: 'text-slate-600'    },
  'Enviada':               { label: 'Enviada',               bg: 'bg-blue-100',     text: 'text-blue-700'     },
  'Parcialmente recibida': { label: 'Parc. recibida',        bg: 'bg-amber-100',    text: 'text-amber-700'    },
  'Recibida':              { label: 'Recibida',              bg: 'bg-emerald-100',  text: 'text-emerald-700'  },
  'Cancelada':             { label: 'Cancelada',             bg: 'bg-red-100',      text: 'text-red-600'      },
}

function StatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const c = STATUS_CONFIG[status]
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>
}

// ── Expandable receive panel ───────────────────────────────────────
function ReceivePanel({ po, onReceived }: { po: PurchaseOrder; onReceived: () => void }) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(po.items.map((it) => [it.id, it.quantity - it.received]))
  )

  function handleReceive() {
    try {
      const poList: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
      const parts   = JSON.parse(localStorage.getItem('parts_list') ?? '[]')
      const moves: StockMovement[] = JSON.parse(localStorage.getItem('stock_movements_list') ?? '[]')
      const now     = new Date().toISOString()

      const updatedItems = po.items.map((it) => {
        const toReceive = quantities[it.id] ?? 0
        return { ...it, received: it.received + toReceive }
      })

      const allReceived = updatedItems.every((it) => it.received >= it.quantity)
      const newStatus: PurchaseOrderStatus = allReceived ? 'Recibida' : 'Parcialmente recibida'

      // Update stock for each part received
      const updatedParts = parts.map((p: { id: string; stock: number }) => {
        const item = po.items.find((it) => it.partId === p.id)
        if (!item) return p
        const qty = quantities[item.id] ?? 0
        if (qty === 0) return p
        const newStock = p.stock + qty
        moves.push({
          id: `mv-${Date.now()}-${p.id}`,
          partId: p.id, partName: item.partName, sku: item.sku,
          type: 'Entrada', quantity: qty, reason: 'Orden de compra',
          referenceId: po.id, referenceNumber: po.number,
          stockBefore: p.stock, stockAfter: newStock, createdAt: now,
        })
        return { ...p, stock: newStock, updatedAt: now }
      })

      // Update PO
      const updatedPOs = poList.map((p) => p.id === po.id
        ? { ...p, items: updatedItems, status: newStatus, receivedAt: allReceived ? now : p.receivedAt }
        : p
      )

      // Update supplier balance: add total received
      const receivedValue = po.items.reduce((a, it) => a + (quantities[it.id] ?? 0) * it.cost, 0)
      const suppList = JSON.parse(localStorage.getItem('suppliers_list') ?? '[]')
      const updatedSuppliers = suppList.map((s: { id: string; balance: number }) =>
        s.id === po.supplierId ? { ...s, balance: s.balance + receivedValue } : s
      )

      localStorage.setItem('purchase_orders_list', JSON.stringify(updatedPOs))
      localStorage.setItem('parts_list', JSON.stringify(updatedParts))
      localStorage.setItem('stock_movements_list', JSON.stringify(moves))
      localStorage.setItem('suppliers_list', JSON.stringify(updatedSuppliers))

      window.dispatchEvent(new CustomEvent('po:updated', { detail: { id: po.id } }))
      window.dispatchEvent(new CustomEvent('part:updated', {}))
      window.dispatchEvent(new CustomEvent('supplier:updated', {}))
      onReceived()
    } catch { /* ignore */ }
  }

  return (
    <div className="px-4 pb-4 pt-2 border-t border-surface-border/60 bg-surface-secondary/30">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Registrar mercancía recibida</p>
      <div className="space-y-2 mb-3">
        {po.items.map((it) => {
          const pending = it.quantity - it.received
          return (
            <div key={it.id} className="flex items-center gap-3 text-sm">
              <div className="flex-1">
                <span className="font-medium text-text-primary">{it.partName}</span>
                <span className="text-text-muted text-xs ml-2">Pedido: {it.quantity} · Ya recibido: {it.received} · Pendiente: {pending}</span>
              </div>
              <input type="number" min={0} max={pending} value={quantities[it.id] ?? 0}
                onChange={(e) => setQuantities((q) => ({ ...q, [it.id]: Math.min(pending, Math.max(0, Number(e.target.value))) }))}
                className="w-20 rounded-lg border border-surface-border px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand" />
            </div>
          )
        })}
      </div>
      <button type="button" onClick={handleReceive}
        className="flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
        <PackageCheck size={14} /> Confirmar recepción
      </button>
    </div>
  )
}

// ── Row with expand ────────────────────────────────────────────────
function PORow({ po, onRefresh, onNavigate }: { po: PurchaseOrder; onRefresh: () => void; onNavigate: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [receiving, setReceiving] = useState(false)
  const c = STATUS_CONFIG[po.status]
  const isPending = po.status === 'Enviada' || po.status === 'Parcialmente recibida'

  function advanceStatus() {
    const list: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
    const next: PurchaseOrderStatus = po.status === 'Borrador' ? 'Enviada' : 'Cancelada'
    const updated = list.map((p) => p.id === po.id ? { ...p, status: next } : p)
    localStorage.setItem('purchase_orders_list', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('po:updated', {}))
    onRefresh()
  }

  function handleDelete() {
    const list: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
    localStorage.setItem('purchase_orders_list', JSON.stringify(list.filter((p) => p.id !== po.id)))
    onRefresh()
  }

  return (
    <div className="border border-surface-border rounded-xl overflow-hidden mb-3">
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white hover:bg-surface-secondary/30 transition-colors">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm font-semibold text-brand">{po.number}</span>
            <StatusBadge status={po.status} />
            <span className="text-sm text-text-primary font-medium">{po.supplierName}</span>
            <span className="text-xs text-text-muted">{po.items.length} línea{po.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
            <span>Creado: {formatDate(po.createdAt)}</span>
            {po.expectedDate && <span>Esperado: {formatDate(po.expectedDate)}</span>}
            <span className="font-medium text-text-primary">Total: {formatCurrency(po.total)}</span>
            {po.balance > 0 && <span className="text-status-danger">Pendiente pago: {formatCurrency(po.balance)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {po.status === 'Borrador' && (
            <button type="button" onClick={advanceStatus} title="Marcar como enviada"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
              <Send size={12} /> Enviar
            </button>
          )}
          {isPending && (
            <button type="button" onClick={() => { setReceiving(!receiving); setExpanded(true) }} title="Registrar recepción"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <PackageCheck size={12} /> Recibir
            </button>
          )}
          <button type="button" onClick={() => onNavigate(po.id)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-brand/10 hover:text-brand transition-colors">
            <Pencil size={14} />
          </button>
          {po.status === 'Borrador' && (
            <button type="button" onClick={handleDelete}
              className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-secondary transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && !receiving && (
        <div className="border-t border-surface-border/60 bg-surface-secondary/30 px-4 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-muted uppercase tracking-wider">
                <th className="text-left pb-2 font-medium">Refacción</th>
                <th className="text-left pb-2 font-medium">SKU</th>
                <th className="text-right pb-2 font-medium">Pedido</th>
                <th className="text-right pb-2 font-medium">Recibido</th>
                <th className="text-right pb-2 font-medium">Costo/u</th>
                <th className="text-right pb-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              {po.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-1.5 font-medium text-text-primary">{it.partName}</td>
                  <td className="py-1.5 font-mono text-text-muted">{it.sku}</td>
                  <td className="py-1.5 text-right">{it.quantity}</td>
                  <td className={`py-1.5 text-right font-medium ${it.received >= it.quantity ? 'text-status-completed' : it.received > 0 ? 'text-status-pending' : 'text-text-muted'}`}>{it.received}</td>
                  <td className="py-1.5 text-right">{formatCurrency(it.cost)}</td>
                  <td className="py-1.5 text-right font-medium">{formatCurrency(it.quantity * it.cost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-surface-border">
              <tr>
                <td colSpan={5} className="pt-2 text-right text-text-muted font-medium">Total IVA incluido</td>
                <td className="pt-2 text-right font-bold text-text-primary">{formatCurrency(po.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Receive panel */}
      {receiving && <ReceivePanel po={po} onReceived={() => { setReceiving(false); onRefresh() }} />}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function PurchaseOrdersPage() {
  const navigate  = useNavigate()
  const [pos, setPOs]   = useState<PurchaseOrder[]>(loadPOs)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('')

  useEffect(() => {
    const refresh = () => setPOs(loadPOs())
    window.addEventListener('po:updated', refresh)
    window.addEventListener('po:created', refresh)
    return () => {
      window.removeEventListener('po:updated', refresh)
      window.removeEventListener('po:created', refresh)
    }
  }, [])

  const draft    = pos.filter((p) => p.status === 'Borrador')
  const sent     = pos.filter((p) => p.status === 'Enviada')
  const pending  = pos.filter((p) => ['Enviada', 'Parcialmente recibida'].includes(p.status))
  const totalPending = pending.reduce((a, p) => a + p.balance, 0)

  const filtered = pos.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.number.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q)
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const STATUS_FILTERS: Array<{ key: PurchaseOrderStatus | ''; label: string }> = [
    { key: '', label: 'Todas' },
    { key: 'Borrador', label: 'Borrador' },
    { key: 'Enviada', label: 'Enviada' },
    { key: 'Parcialmente recibida', label: 'Parc. recibida' },
    { key: 'Recibida', label: 'Recibida' },
    { key: 'Cancelada', label: 'Cancelada' },
  ]

  return (
    <div>
      <PageHeader
        title="Órdenes de Compra"
        description="Pedidos a proveedores de refacciones"
        actions={
          <button onClick={() => navigate('/inventory/purchase-orders/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Nueva Orden
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="En borrador"        value={draft.length}          sub="Sin enviar al proveedor"   icon={ShoppingCart}  iconColor="text-text-muted" />
        <KpiCard label="Enviadas"           value={sent.length}           sub="Aguardando mercancía"      icon={Send}          iconColor="text-status-progress" />
        <KpiCard label="Pendientes recibir" value={pending.length}        sub="En tránsito o parciales"   icon={Clock}         iconColor="text-status-pending" />
        <KpiCard label="Por pagar"          value={formatCurrency(totalPending)} sub="Saldo en OCs abiertas" icon={CheckCircle} iconColor="text-status-danger" />
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <SearchInput placeholder="Buscar por número o proveedor…" onChange={setSearch} />
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(({ key, label }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === key ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary hover:bg-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No hay órdenes de compra" description="Crea la primera orden para solicitar mercancía a un proveedor" />
        ) : (
          <div>
            {filtered.map((po) => (
              <PORow key={po.id} po={po} onRefresh={() => setPOs(loadPOs())} onNavigate={(id) => navigate(`/inventory/purchase-orders/${id}/edit`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
