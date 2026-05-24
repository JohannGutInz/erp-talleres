import { useState, useEffect } from 'react'
import { Wallet, Plus, X, CheckCircle, AlertTriangle, DollarSign, Clock } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchInput } from '@/components/ui/SearchInput'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Credit, CreditPaymentMethod, PurchaseOrder, Supplier } from '@/types/inventory.types'

function loadCredits(): Credit[] {
  try { return JSON.parse(localStorage.getItem('credits_list') ?? '[]') } catch { return [] }
}

function loadOpenPOs(): PurchaseOrder[] {
  try {
    const all: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
    return all.filter((p) => p.balance > 0 && !['Cancelada'].includes(p.status))
  } catch { return [] }
}

function loadSuppliers(): Supplier[] {
  try { return JSON.parse(localStorage.getItem('suppliers_list') ?? '[]') } catch { return [] }
}

const METHODS: CreditPaymentMethod[] = ['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta de débito', 'Tarjeta de crédito']

const METHOD_ICONS: Record<CreditPaymentMethod, string> = {
  'Efectivo': '💵', 'Transferencia': '🏦', 'Cheque': '📄',
  'Tarjeta de débito': '💳', 'Tarjeta de crédito': '💳',
}

// ── Quick register form ────────────────────────────────────────────
function RegisterCreditForm({ onAdded }: { onAdded: () => void }) {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [amount, setAmount]         = useState('')
  const [method, setMethod]         = useState<CreditPaymentMethod>('Transferencia')
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [reference, setReference]   = useState('')
  const [notes, setNotes]           = useState('')
  const [error, setError]           = useState('')
  const [openPOs, setOpenPOs]       = useState<PurchaseOrder[]>(loadOpenPOs)

  const input = 'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

  function validate(): boolean {
    if (!selectedPO) { setError('Selecciona una orden de compra'); return false }
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Ingresa un monto válido'); return false }
    if (amt > selectedPO.balance) { setError(`El monto no puede superar el saldo pendiente de ${formatCurrency(selectedPO.balance)}`); return false }
    if (!date) { setError('Ingresa la fecha del abono'); return false }
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate() || !selectedPO) return
    const amt = parseFloat(amount)

    try {
      // 1. Save credit
      const credits: Credit[] = JSON.parse(localStorage.getItem('credits_list') ?? '[]')
      const newCredit: Credit = {
        id: `cr-${Date.now()}`,
        purchaseOrderId: selectedPO.id,
        purchaseOrderNumber: selectedPO.number,
        supplierId: selectedPO.supplierId,
        supplierName: selectedPO.supplierName,
        amount: amt, method, date, reference, notes,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('credits_list', JSON.stringify([newCredit, ...credits]))

      // 2. Update PO paid/balance
      const pos: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
      const updatedPOs = pos.map((p) => {
        if (p.id !== selectedPO.id) return p
        const newPaid    = p.paid + amt
        const newBalance = p.total - newPaid
        return { ...p, paid: newPaid, balance: Math.max(0, newBalance) }
      })
      localStorage.setItem('purchase_orders_list', JSON.stringify(updatedPOs))

      // 3. Update supplier balance
      const suppliers: Supplier[] = JSON.parse(localStorage.getItem('suppliers_list') ?? '[]')
      const updatedSuppliers = suppliers.map((s) =>
        s.id === selectedPO.supplierId ? { ...s, balance: Math.max(0, s.balance - amt) } : s
      )
      localStorage.setItem('suppliers_list', JSON.stringify(updatedSuppliers))

      window.dispatchEvent(new CustomEvent('credit:created', { detail: newCredit }))
      window.dispatchEvent(new CustomEvent('po:updated', {}))
      window.dispatchEvent(new CustomEvent('supplier:updated', {}))

      // Reset form
      setSelectedPO(null); setAmount(''); setReference(''); setNotes('')
      setOpenPOs(loadOpenPOs())
      onAdded()
    } catch { setError('Error al guardar el abono') }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/8 ring-1 ring-brand/12">
          <Plus size={16} className="text-brand" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Registrar abono</h2>
          <p className="text-xs text-text-muted">Aplica un pago a una orden de compra</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* PO selector */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-text-secondary mb-1">Orden de compra *</label>
          {selectedPO ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">{selectedPO.number} · {selectedPO.supplierName}</p>
                <p className="text-xs text-text-muted">Saldo pendiente: <span className="font-medium text-status-danger">{formatCurrency(selectedPO.balance)}</span></p>
              </div>
              <button type="button" onClick={() => setSelectedPO(null)} className="text-text-muted hover:text-red-500"><X size={16} /></button>
            </div>
          ) : openPOs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-border px-4 py-4 text-center text-sm text-text-muted">
              No hay órdenes de compra con saldo pendiente
            </div>
          ) : (
            <select onChange={(e) => {
              const po = openPOs.find((p) => p.id === e.target.value)
              setSelectedPO(po ?? null)
              if (po) setAmount(String(po.balance.toFixed(2)))
            }} className={input} defaultValue="">
              <option value="" disabled>— Seleccionar orden —</option>
              {openPOs.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.number} · {po.supplierName} · Pendiente: {formatCurrency(po.balance)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Monto del abono (MXN) *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={0.01} step={0.01}
              placeholder={selectedPO ? selectedPO.balance.toFixed(2) : '0.00'} className={`${input} pl-7`} />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Fecha del pago *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </div>

        {/* Method */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-text-secondary mb-2">Forma de pago *</label>
          <div className="flex gap-2 flex-wrap">
            {METHODS.map((m) => (
              <button key={m} type="button" onClick={() => setMethod(m)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${method === m ? 'bg-brand text-white' : 'border border-surface-border bg-white text-text-secondary hover:bg-surface-secondary'}`}>
                <span>{METHOD_ICONS[m]}</span> {m}
              </button>
            ))}
          </div>
        </div>

        {/* Reference */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Referencia / Folio</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)}
            placeholder="No. de transferencia, cheque…" className={input} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Notas</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones adicionales" className={input} />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit"
          className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm">
          <CheckCircle size={15} /> Registrar abono
        </button>
      </div>
    </form>
  )
}

// ── Credit row ─────────────────────────────────────────────────────
function CreditRow({ credit, onDelete }: { credit: Credit; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-surface-border bg-white px-4 py-3 hover:border-brand/20 hover:bg-surface-secondary/20 transition-colors">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
        <CheckCircle size={16} className="text-status-completed" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-primary">{formatCurrency(credit.amount)}</span>
          <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-text-muted">{credit.method}</span>
          <span className="text-xs text-text-muted">→ {credit.purchaseOrderNumber}</span>
        </div>
        <p className="text-xs text-text-muted mt-0.5">
          {credit.supplierName} · {formatDate(credit.date)}
          {credit.reference ? ` · Ref: ${credit.reference}` : ''}
        </p>
      </div>
      <button type="button" onClick={onDelete}
        className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

// ── Supplier balance summary ───────────────────────────────────────
function SupplierBalanceCard({ supplier }: { supplier: Supplier }) {
  const openPOs = loadOpenPOs().filter((p) => p.supplierId === supplier.id)
  return (
    <div className="rounded-xl border border-surface-border bg-white p-4">
      <p className="text-sm font-medium text-text-primary truncate">{supplier.name}</p>
      <p className={`text-lg font-bold mt-1 ${supplier.balance > 0 ? 'text-status-danger' : 'text-status-completed'}`}>
        {formatCurrency(supplier.balance)}
      </p>
      <p className="text-xs text-text-muted">{openPOs.length} OC abierta{openPOs.length !== 1 ? 's' : ''}</p>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>(loadCredits)
  const [search, setSearch]   = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadSuppliers().filter((s) => s.balance > 0))

  useEffect(() => {
    function refresh() {
      setCredits(loadCredits())
      setSuppliers(loadSuppliers().filter((s) => s.balance > 0))
    }
    window.addEventListener('credit:created', refresh)
    window.addEventListener('supplier:updated', refresh)
    return () => {
      window.removeEventListener('credit:created', refresh)
      window.removeEventListener('supplier:updated', refresh)
    }
  }, [])

  function handleDelete(id: string) {
    const updated = credits.filter((c) => c.id !== id)
    localStorage.setItem('credits_list', JSON.stringify(updated))
    setCredits(updated)
  }

  // KPIs
  const totalPaid      = credits.reduce((a, c) => a + c.amount, 0)
  const allSuppliers   = loadSuppliers()
  const totalOwed      = allSuppliers.reduce((a, s) => a + s.balance, 0)
  const thisMonth      = credits.filter((c) => c.date.startsWith(new Date().toISOString().slice(0, 7)))
  const thisMonthTotal = thisMonth.reduce((a, c) => a + c.amount, 0)

  const filtered = credits.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.supplierName.toLowerCase().includes(q) || c.purchaseOrderNumber.toLowerCase().includes(q) || (c.reference ?? '').toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader title="Abonos a Proveedores" description="Registro de pagos y saldos con proveedores" />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Deuda total"      value={formatCurrency(totalOwed)}       sub="Con todos los proveedores"  icon={AlertTriangle} iconColor="text-status-danger" />
        <KpiCard label="Pagado este mes"  value={formatCurrency(thisMonthTotal)}  sub={`${thisMonth.length} abonos`} icon={CheckCircle} iconColor="text-status-completed" />
        <KpiCard label="Total abonado"    value={formatCurrency(totalPaid)}       sub="Histórico de pagos"         icon={Wallet}        iconColor="text-status-progress" />
        <KpiCard label="Prov. con deuda"  value={suppliers.length}               sub="Requieren pago"             icon={DollarSign}    iconColor="text-status-pending" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Form + list */}
        <div className="col-span-2 space-y-5">
          <RegisterCreditForm onAdded={() => setCredits(loadCredits())} />

          {/* Credits list */}
          <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold text-text-primary flex-1">Historial de abonos</h3>
              <SearchInput placeholder="Buscar por proveedor, OC o referencia…" onChange={setSearch} />
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon={Wallet} message="Sin abonos registrados" description="Registra el primer pago a un proveedor" />
            ) : (
              <div className="space-y-2">
                {filtered.map((c) => (
                  <CreditRow key={c.id} credit={c} onDelete={() => handleDelete(c.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Supplier balances */}
        <div className="space-y-5">
          <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">Saldos pendientes</h3>
            </div>
            {suppliers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Sin deudas con proveedores</p>
            ) : (
              <div className="space-y-3">
                {suppliers.map((s) => <SupplierBalanceCard key={s.id} supplier={s} />)}
              </div>
            )}
          </div>

          {/* Payment method breakdown */}
          {credits.length > 0 && (
            <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Por forma de pago</h3>
              <div className="space-y-2">
                {METHODS.map((m) => {
                  const total = credits.filter((c) => c.method === m).reduce((a, c) => a + c.amount, 0)
                  if (total === 0) return null
                  return (
                    <div key={m} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary flex items-center gap-1.5">{METHOD_ICONS[m]} {m}</span>
                      <span className="font-medium text-text-primary">{formatCurrency(total)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
