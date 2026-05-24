import { useMemo, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, ArrowRight, Pencil, Plus, Search, X, DollarSign, MapPin, Truck } from 'lucide-react'
import type { Part, Supplier } from '@/types/inventory.types'
import { PART_CATEGORIES } from '@/types/inventory.types'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSection } from '@/components/ui/FormSection'
import { formatCurrency } from '@/lib/utils'

const num = (min = 0) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v as number)) ? undefined : Number(v)),
    z.number().min(min).optional()
  )

const partFormSchema = z.object({
  sku:          z.string().min(1, 'SKU requerido'),
  name:         z.string().min(2, 'Nombre requerido'),
  description:  z.string().optional(),
  category:     z.string().min(1, 'Categoría requerida'),
  brand:        z.string().optional(),
  supplierId:   z.string().optional(),
  supplierName: z.string().optional(),
  cost:         z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().min(0, 'Costo requerido')),
  price:        z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().min(0, 'Precio requerido')),
  stock:        z.preprocess((v) => (v === '' || v === null ? 0 : Number(v)), z.number().min(0)),
  minStock:     z.preprocess((v) => (v === '' || v === null ? 0 : Number(v)), z.number().min(0)),
  unit:         z.string().optional(),
  location:     z.string().optional(),
})

type PartFormValues = z.infer<typeof partFormSchema>

const input = 'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

const UNITS = ['pieza', 'litro', 'set', 'kit', 'metro', 'par']

function loadSuppliers(): Supplier[] {
  try { return JSON.parse(localStorage.getItem('suppliers_list') ?? '[]') } catch { return [] }
}

export default function NewPartPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const isEdit   = !!id
  const [supplierQuery, setSupplierQuery]     = useState('')
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([])
  const [showSuppliers, setShowSuppliers]     = useState(false)

  const stored = useMemo((): PartFormValues | null => {
    if (!id) return null
    try {
      const list: Part[] = JSON.parse(localStorage.getItem('parts_list') ?? '[]')
      const found = list.find((p) => p.id === id)
      if (!found) return null
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...vals } = found
      return vals as PartFormValues
    } catch { return null }
  }, [id])

  const { register, watch, setValue, handleSubmit, formState: { isSubmitting, errors } } = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: stored ?? { sku: '', name: '', description: '', category: '', brand: '', supplierId: '', supplierName: '', cost: undefined, price: undefined, stock: 0, minStock: 0, unit: 'pieza', location: '' },
  })

  useEffect(() => {
    if (isEdit && stored === null) navigate('/inventory/parts', { replace: true })
  }, [isEdit, stored, navigate])

  useEffect(() => {
    if (!supplierQuery) { setSupplierResults([]); setShowSuppliers(false); return }
    const t = setTimeout(() => {
      const all = loadSuppliers()
      setSupplierResults(all.filter((s) => s.name.toLowerCase().includes(supplierQuery.toLowerCase())).slice(0, 6))
      setShowSuppliers(true)
    }, 250)
    return () => clearTimeout(t)
  }, [supplierQuery])

  const cost  = watch('cost')
  const price = watch('price')
  const supplierName = watch('supplierName')
  const hasErrors = Object.keys(errors).length > 0

  const margin = cost && price ? ((price - cost) / price * 100) : null

  function selectSupplier(s: Supplier) {
    setValue('supplierId', s.id)
    setValue('supplierName', s.name)
    setSupplierQuery(''); setShowSuppliers(false)
  }

  function clearSupplier() {
    setValue('supplierId', '')
    setValue('supplierName', '')
    setSupplierQuery('')
  }

  function onSubmit(data: PartFormValues) {
    try {
      const list: Part[] = JSON.parse(localStorage.getItem('parts_list') ?? '[]')
      const now = new Date().toISOString()
      if (isEdit && id) {
        const updated = list.map((p) => p.id === id ? { ...p, ...data, updatedAt: now } : p)
        localStorage.setItem('parts_list', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('part:updated', { detail: { id } }))
      } else {
        const entry: Part = { id: `p-${Date.now()}`, ...data, createdAt: now, updatedAt: now } as Part
        localStorage.setItem('parts_list', JSON.stringify([entry, ...list]))
        window.dispatchEvent(new CustomEvent('part:created', { detail: entry }))
      }
    } catch { /* ignore */ }
    navigate('/inventory/parts')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? 'Editar Refacción' : 'Nueva Refacción'}
        description={isEdit ? 'Modifica los datos de la refacción' : 'Registra una nueva refacción en el inventario'}
        actions={
          <button type="button" onClick={() => navigate('/inventory/parts')}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
            <Package size={14} /> Ver inventario
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-3 gap-5 items-start pb-24">
        <div className="col-span-2 space-y-5">
          {/* Identificación */}
          <FormSection icon={Package} title="Identificación" subtitle="SKU, nombre, categoría y marca">
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">SKU *</label>
                <input {...register('sku')} placeholder="Ej: FIL-0023" className={`${input} uppercase font-mono`} />
                {errors.sku && <p className="mt-1 text-xs text-status-danger">{errors.sku.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Marca</label>
                <input {...register('brand')} placeholder="Bosch, NGK, Mann…" className={input} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Nombre *</label>
                <input {...register('name')} placeholder="Ej: Filtro de aceite 5W30" className={input} />
                {errors.name && <p className="mt-1 text-xs text-status-danger">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Categoría *</label>
                <select {...register('category')} className={input}>
                  <option value="">— Seleccionar —</option>
                  {PART_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-xs text-status-danger">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Unidad</label>
                <select {...register('unit')} className={input}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Descripción</label>
                <textarea {...register('description')} rows={2} placeholder="Especificaciones adicionales, compatibilidades…" className={`${input} resize-none`} />
              </div>
            </div>
          </FormSection>

          {/* Proveedor */}
          <FormSection icon={Truck} title="Proveedor" subtitle="Proveedor habitual de esta refacción">
            <div className="mt-4">
              {supplierName ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{supplierName}</p>
                    <p className="text-xs text-text-muted">Proveedor asociado</p>
                  </div>
                  <button type="button" onClick={clearSupplier}
                    className="text-text-muted hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input value={supplierQuery} onChange={(e) => setSupplierQuery(e.target.value)}
                    placeholder="Buscar proveedor por nombre…" className={`${input} pl-9`} />
                  {showSuppliers && (
                    <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
                      {supplierResults.length > 0 ? supplierResults.map((s) => (
                        <button key={s.id} type="button" onClick={() => selectSupplier(s)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-secondary text-left">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{s.name}</p>
                            {s.contact && <p className="text-xs text-text-muted">{s.contact}</p>}
                          </div>
                        </button>
                      )) : (
                        <div className="px-4 py-3 text-sm text-text-muted">No se encontró el proveedor</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormSection>

          {/* Precios */}
          <FormSection icon={DollarSign} title="Precios" subtitle="Costo de compra y precio de venta al cliente">
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Costo unitario (MXN) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input {...register('cost', { valueAsNumber: true })} type="number" min={0} step={0.01} placeholder="0.00" className={`${input} pl-7`} />
                </div>
                {errors.cost && <p className="mt-1 text-xs text-status-danger">{errors.cost.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Precio de venta (MXN) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input {...register('price', { valueAsNumber: true })} type="number" min={0} step={0.01} placeholder="0.00" className={`${input} pl-7`} />
                </div>
                {errors.price && <p className="mt-1 text-xs text-status-danger">{errors.price.message}</p>}
              </div>
              {margin !== null && (
                <div className="col-span-2 rounded-xl bg-surface-secondary px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Margen de utilidad</span>
                  <span className={`text-sm font-bold ${margin >= 30 ? 'text-status-completed' : margin >= 15 ? 'text-status-pending' : 'text-status-danger'}`}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </FormSection>

          {/* Stock y ubicación */}
          <FormSection icon={MapPin} title="Stock y ubicación" subtitle="Existencias actuales y punto de reorden">
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Stock actual</label>
                <input {...register('stock', { valueAsNumber: true })} type="number" min={0} placeholder="0" className={input} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Stock mínimo</label>
                <input {...register('minStock', { valueAsNumber: true })} type="number" min={0} placeholder="0" className={input} />
                <p className="text-xs text-text-muted mt-1">Dispara alerta de reorden</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Ubicación</label>
                <input {...register('location')} placeholder="Ej: Estante A-3" className={input} />
              </div>
            </div>
          </FormSection>
        </div>

        {/* Sidebar summary */}
        <div className="sticky top-5 rounded-2xl border border-surface-border bg-white shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-text-primary">Resumen</p>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Costo compra', value: cost ? formatCurrency(cost) : '—' },
              { label: 'Precio venta', value: price ? formatCurrency(price) : '—' },
              { label: 'Margen', value: margin !== null ? `${margin.toFixed(1)}%` : '—' },
              { label: 'Proveedor', value: supplierName || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-text-muted">{label}</span>
                <span className="font-medium text-text-primary">{value}</span>
              </div>
            ))}
          </div>
          {cost && price && margin !== null && (
            <div className={`rounded-xl px-3 py-2 text-xs text-center font-medium ${margin >= 30 ? 'bg-emerald-50 text-emerald-700' : margin >= 15 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
              {margin >= 30 ? 'Margen saludable' : margin >= 15 ? 'Margen aceptable' : 'Margen bajo'}
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-30 -mx-6 border-t border-surface-border bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {hasErrors ? <span className="text-status-danger font-medium">Revisa los campos con errores</span> : 'Los campos con * son obligatorios'}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/inventory/parts')}
              className="rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm">
              {isEdit ? <Pencil size={15} /> : <Plus size={15} />}
              {isEdit ? 'Guardar cambios' : 'Registrar refacción'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
