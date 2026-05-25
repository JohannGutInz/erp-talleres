import { useMemo, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShoppingCart, ArrowRight, Pencil, Plus, Search, X, Truck, Trash2, Package, Calendar } from 'lucide-react'
import type { PurchaseOrder, PurchaseOrderItem, Supplier, Part } from '@/types/inventory.types'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSection } from '@/components/ui/FormSection'
import { formatCurrency } from '@/lib/utils'

const poItemSchema = z.object({
  id:       z.string(),
  partId:   z.string(),
  partName: z.string(),
  sku:      z.string(),
  quantity: z.number().min(1, 'Mín. 1'),
  cost:     z.number().min(0, 'Costo requerido'),
  received: z.number().default(0),
})

const poFormSchema = z.object({
  supplierId:   z.string().min(1, 'Proveedor requerido'),
  supplierName: z.string(),
  items:        z.array(poItemSchema).min(1, 'Agrega al menos una refacción'),
  notes:        z.string().optional(),
  expectedDate: z.string().optional(),
})

type POFormValues = z.infer<typeof poFormSchema>

const input = 'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

function loadSuppliers(): Supplier[] {
  try { return JSON.parse(localStorage.getItem('suppliers_list') ?? '[]') } catch { return [] }
}

function loadParts(): Part[] {
  try { return JSON.parse(localStorage.getItem('parts_list') ?? '[]') } catch { return [] }
}

function nextPONumber(): string {
  try {
    const list: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
    const num = list.length + 1
    return `OC-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`
  } catch { return `OC-${Date.now()}` }
}

export default function NewPurchaseOrderPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const isEdit   = !!id

  const [supplierQuery, setSupplierQuery]     = useState('')
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([])
  const [showSuppliers, setShowSuppliers]     = useState(false)
  const [partQuery, setPartQuery]             = useState('')
  const [partResults, setPartResults]         = useState<Part[]>([])
  const [showParts, setShowParts]             = useState(false)

  const stored = useMemo((): POFormValues | null => {
    if (!id) return null
    try {
      const list: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
      const found = list.find((p) => p.id === id)
      if (!found) return null
      return { supplierId: found.supplierId, supplierName: found.supplierName, items: found.items, notes: found.notes, expectedDate: found.expectedDate }
    } catch { return null }
  }, [id])

  const { register, watch, setValue, handleSubmit, control, formState: { isSubmitting, errors } } = useForm<POFormValues>({
    resolver: zodResolver(poFormSchema) as Resolver<POFormValues>,
    defaultValues: stored ?? { supplierId: '', supplierName: '', items: [], notes: '', expectedDate: '' },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    if (isEdit && stored === null) navigate('/inventory/purchase-orders', { replace: true })
  }, [isEdit, stored, navigate])

  // Supplier search
  useEffect(() => {
    if (!supplierQuery) { setSupplierResults([]); setShowSuppliers(false); return }
    const t = setTimeout(() => {
      setSupplierResults(loadSuppliers().filter((s) => s.name.toLowerCase().includes(supplierQuery.toLowerCase())).slice(0, 6))
      setShowSuppliers(true)
    }, 250)
    return () => clearTimeout(t)
  }, [supplierQuery])

  // Part search
  useEffect(() => {
    if (!partQuery) { setPartResults([]); setShowParts(false); return }
    const t = setTimeout(() => {
      const q = partQuery.toLowerCase()
      setPartResults(loadParts().filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 8))
      setShowParts(true)
    }, 250)
    return () => clearTimeout(t)
  }, [partQuery])

  const supplierName = watch('supplierName')
  const items        = watch('items') ?? []
  const hasErrors    = Object.keys(errors).length > 0

  const subtotal = items.reduce((a, it) => a + (it.quantity || 0) * (it.cost || 0), 0)
  const tax      = subtotal * 0.16
  const total    = subtotal + tax

  function selectSupplier(s: Supplier) {
    setValue('supplierId', s.id)
    setValue('supplierName', s.name)
    setSupplierQuery(''); setShowSuppliers(false)
  }

  function clearSupplier() {
    setValue('supplierId', '')
    setValue('supplierName', '')
  }

  function addPart(p: Part) {
    if (fields.some((f) => f.partId === p.id)) return
    append({ id: crypto.randomUUID(), partId: p.id, partName: p.name, sku: p.sku, quantity: 1, cost: p.cost, received: 0 })
    setPartQuery(''); setShowParts(false)
  }

  function onSubmit(data: POFormValues) {
    try {
      const list: PurchaseOrder[] = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
      const sub  = data.items.reduce((a, it) => a + it.quantity * it.cost, 0)
      const tx   = sub * 0.16
      const tot  = sub + tx

      if (isEdit && id) {
        const updated = list.map((p) => p.id === id
          ? { ...p, supplierId: data.supplierId, supplierName: data.supplierName, items: data.items, subtotal: sub, tax: tx, total: tot, balance: tot - p.paid, notes: data.notes, expectedDate: data.expectedDate }
          : p
        )
        localStorage.setItem('purchase_orders_list', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('po:updated', { detail: { id } }))
      } else {
        const entry: PurchaseOrder = {
          id: `po-${Date.now()}`, number: nextPONumber(),
          supplierId: data.supplierId, supplierName: data.supplierName,
          status: 'Borrador', items: data.items,
          subtotal: sub, tax: tx, total: tot, paid: 0, balance: tot,
          notes: data.notes, expectedDate: data.expectedDate,
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('purchase_orders_list', JSON.stringify([entry, ...list]))
        window.dispatchEvent(new CustomEvent('po:created', { detail: entry }))
      }
    } catch { /* ignore */ }
    navigate('/inventory/purchase-orders')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
        description={isEdit ? 'Modifica la orden antes de enviarla al proveedor' : 'Genera una solicitud de compra de refacciones'}
        actions={
          <button type="button" onClick={() => navigate('/inventory/purchase-orders')}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
            <ShoppingCart size={14} /> Ver órdenes
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-3 gap-5 items-start pb-24">
        <div className="col-span-2 space-y-5">
          {/* Proveedor */}
          <FormSection icon={Truck} title="Proveedor" subtitle="A quién se emite la orden de compra">
            <div className="mt-4">
              {supplierName ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{supplierName}</p>
                    <p className="text-xs text-text-muted">Proveedor seleccionado</p>
                  </div>
                  <button type="button" onClick={clearSupplier} className="text-text-muted hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input value={supplierQuery} onChange={(e) => setSupplierQuery(e.target.value)}
                    placeholder="Buscar proveedor…" className={`${input} pl-9`} />
                  {showSuppliers && (
                    <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
                      {supplierResults.length > 0 ? supplierResults.map((s) => (
                        <button key={s.id} type="button" onClick={() => selectSupplier(s)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-secondary text-left">
                          <Truck size={14} className="text-text-muted shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-text-primary">{s.name}</p>
                            {s.creditDays !== undefined && <p className="text-xs text-text-muted">Crédito: {s.creditDays} días</p>}
                          </div>
                        </button>
                      )) : <div className="px-4 py-3 text-sm text-text-muted">Sin resultados</div>}
                    </div>
                  )}
                </div>
              )}
              {errors.supplierId && <p className="mt-1 text-xs text-status-danger">{errors.supplierId.message}</p>}
            </div>
          </FormSection>

          {/* Líneas de refacciones */}
          <FormSection icon={Package} title="Refacciones solicitadas" subtitle="Partes y cantidades a pedir"
            badge={fields.length > 0 ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-text-secondary">{fields.length}</span> : undefined}>
            <div className="mt-4 space-y-3">
              {/* Part search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={partQuery} onChange={(e) => setPartQuery(e.target.value)}
                  placeholder="Buscar refacción por nombre o SKU…" className={`${input} pl-9`} />
                {showParts && partResults.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
                    {partResults.map((p) => (
                      <button key={p.id} type="button" onClick={() => addPart(p)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-secondary text-left">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{p.name}</p>
                          <p className="text-xs text-text-muted font-mono">{p.sku} · Costo: {formatCurrency(p.cost)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock > p.minStock ? 'bg-emerald-100 text-emerald-700' : p.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock} uds
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.items && <p className="text-xs text-status-danger">{errors.items.message}</p>}

              {fields.length > 0 && (
                <div className="rounded-xl border border-surface-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-secondary text-xs text-text-muted uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Refacción</th>
                        <th className="px-4 py-2 text-left font-medium">SKU</th>
                        <th className="px-4 py-2 text-center font-medium w-24">Cantidad</th>
                        <th className="px-4 py-2 text-right font-medium w-32">Costo/u</th>
                        <th className="px-4 py-2 text-right font-medium w-32">Subtotal</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, i) => {
                        const qty  = items[i]?.quantity ?? 0
                        const cost = items[i]?.cost ?? 0
                        return (
                          <tr key={field.id} className="border-t border-surface-border/60">
                            <td className="px-4 py-2.5 font-medium text-text-primary">{field.partName}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-text-muted">{field.sku}</td>
                            <td className="px-4 py-2.5">
                              <input {...register(`items.${i}.quantity`, { valueAsNumber: true })} type="number" min={1}
                                className="w-20 text-center rounded-lg border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand" />
                            </td>
                            <td className="px-4 py-2.5">
                              <input {...register(`items.${i}.cost`, { valueAsNumber: true })} type="number" min={0} step={0.01}
                                className="w-28 text-right rounded-lg border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand" />
                            </td>
                            <td className="px-4 py-2.5 text-right font-medium text-text-primary">{formatCurrency(qty * cost)}</td>
                            <td className="px-3 py-2.5">
                              <button type="button" onClick={() => remove(i)}
                                className="rounded-lg p-1 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </FormSection>

          {/* Notas y fecha */}
          <FormSection icon={Calendar} title="Fechas y notas" subtitle="Fecha esperada de entrega y observaciones" collapsible defaultOpen={false}>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Fecha esperada de entrega</label>
                <input {...register('expectedDate')} type="date" className={input} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Notas para el proveedor</label>
                <textarea {...register('notes')} rows={3} placeholder="Instrucciones de entrega, referencias de pedido, condiciones especiales…" className={`${input} resize-none`} />
              </div>
            </div>
          </FormSection>
        </div>

        {/* Sidebar totales */}
        <div className="sticky top-5 rounded-2xl border border-surface-border bg-white shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-text-primary">Totales</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">IVA (16%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-surface-border pt-2">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="font-bold text-xl text-text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-surface-border text-xs space-y-1">
            <div className="flex justify-between text-text-muted">
              <span>Líneas de artículos</span>
              <span>{fields.length}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Proveedor</span>
              <span className="text-text-primary font-medium truncate max-w-[120px]">{supplierName || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-30 -mx-6 border-t border-surface-border bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {hasErrors ? <span className="text-status-danger font-medium">Revisa los campos con errores</span> : 'La orden se guardará como Borrador'}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/inventory/purchase-orders')}
              className="rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm">
              {isEdit ? <Pencil size={15} /> : <Plus size={15} />}
              {isEdit ? 'Guardar cambios' : 'Crear orden'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
