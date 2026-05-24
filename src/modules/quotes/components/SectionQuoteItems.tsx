import { useState } from 'react'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { Plus, Trash2, Search, AlertTriangle, CheckCircle, XCircle, Package, ChevronDown, ChevronUp } from 'lucide-react'
import type { QuoteFormValues } from '@/types/quote.types'
import type { Part } from '@/types/inventory.types'
import { MOCK_PARTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { SectionCard } from './SectionCard'

const inputCls = 'w-full rounded-lg border border-surface-border px-2.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand'

// Service packages — these will come from the catalog module in a future iteration
const SERVICE_PACKAGES = [
  {
    id: 'pkg_afin_mayor_6cil',
    name: 'Afinación Mayor 6 cil.',
    price: 1699,
    badge: '6 cil.',
    description: 'Aceite mineral · Filtros · Bujías · Limpieza · Inspección',
    includes: [
      'Aceite para motor (mineral)',
      'Filtro de aceite',
      'Bujías convencionales',
      'Limpieza cuerpo de aceleración',
      'Relleno de niveles',
      'Limpieza de motor',
      'Inspección de seguridad',
    ],
    labor: [
      { service: 'Limpieza de cuerpo de aceleración', hours: 1, unitPrice: 304 },
      { service: 'Relleno de niveles', hours: 0.5, unitPrice: 0 },
      { service: 'Limpieza exterior de motor', hours: 0.5, unitPrice: 0 },
      { service: 'Inspección de seguridad', hours: 0.5, unitPrice: 0 },
    ],
    parts: [
      { name: 'Aceite mineral 5W30 (1L)', sku: 'ACC-0001', quantity: 6, unitPrice: 100, availableStock: 24 },
      { name: 'Filtro de aceite', sku: 'FIL-0023', quantity: 1, unitPrice: 160, availableStock: 8 },
      { name: 'Bujías convencionales (x6)', sku: 'BUJ-0011', quantity: 1, unitPrice: 400, availableStock: 10 },
    ],
  },
]

function StockBadge({ stock, quantity }: { stock: number; quantity: number }) {
  if (stock === 0)
    return <span className="flex items-center gap-1 text-xs font-medium text-status-danger whitespace-nowrap"><XCircle size={12} /> Sin stock</span>
  if (stock < quantity)
    return <span className="flex items-center gap-1 text-xs font-medium text-amber-600 whitespace-nowrap"><AlertTriangle size={12} /> Solo {stock}</span>
  return <span className="flex items-center gap-1 text-xs font-medium text-status-completed whitespace-nowrap"><CheckCircle size={12} /> {stock} disp.</span>
}

export function SectionQuoteItems() {
  const { register, control, watch } = useFormContext<QuoteFormValues>()
  const [partSearch, setPartSearch] = useState('')
  const [showPartDropdown, setShowPartDropdown] = useState(false)
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null)

  const { fields: laborFields, append: appendLabor, remove: removeLabor } = useFieldArray({ control, name: 'laborItems' })
  const { fields: partFields, append: appendPart, remove: removePart } = useFieldArray({ control, name: 'partItems' })

  const laborItems = watch('laborItems') ?? []
  const partItems = watch('partItems') ?? []
  const discount = watch('discount') ?? 0

  const subtotal =
    laborItems.reduce((s, l) => s + (l.hours || 0) * (l.unitPrice || 0), 0) +
    partItems.reduce((s, p) => s + (p.quantity || 0) * (p.unitPrice || 0), 0)
  const discountAmount = subtotal * (discount / 100)
  const tax = (subtotal - discountAmount) * 0.16
  const total = subtotal - discountAmount + tax

  const filteredParts = partSearch.length >= 2
    ? MOCK_PARTS.filter((p) =>
        p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(partSearch.toLowerCase())
      )
    : []

  function addPart(p: Part) {
    appendPart({ id: crypto.randomUUID(), partId: p.id, name: p.name, sku: p.sku, quantity: 1, unitPrice: p.price, availableStock: p.stock })
    setPartSearch('')
    setShowPartDropdown(false)
  }

  function applyPackage(pkg: typeof SERVICE_PACKAGES[0]) {
    pkg.labor.forEach((l) => appendLabor({ id: crypto.randomUUID(), ...l }))
    pkg.parts.forEach((p) => appendPart({ id: crypto.randomUUID(), partId: '', ...p }))
  }

  return (
    <SectionCard number={6} title="Cotización" subtitle="Paquetes, mano de obra y refacciones">
      <div className="space-y-6">

        {/* Service packages */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package size={15} className="text-brand" />
            <p className="text-sm font-semibold text-text-primary">Paquetes de servicio</p>
            <span className="rounded-full bg-surface-secondary border border-surface-border px-2 py-0.5 text-xs text-text-muted">desde catálogo</span>
          </div>
          <div className="space-y-2">
            {SERVICE_PACKAGES.map((pkg) => {
              const isExpanded = expandedPkg === pkg.id
              return (
                <div key={pkg.id} className="rounded-xl border border-surface-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-surface-secondary/70">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text-primary">{pkg.name}</p>
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">{pkg.badge}</span>
                        </div>
                        <p className="text-xs text-text-muted">{pkg.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-bold text-text-primary">{formatCurrency(pkg.price)}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedPkg(isExpanded ? null : pkg.id)}
                        className="text-text-muted hover:text-text-primary transition-colors"
                        title="Ver detalle"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPackage(pkg)}
                        className="flex items-center gap-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-3 py-2 transition-colors"
                      >
                        <Plus size={12} /> Aplicar
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 py-3 border-t border-surface-border bg-white">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Incluye:</p>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {pkg.includes.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                            <CheckCircle size={11} className="text-status-completed shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-surface-border" />

        {/* Labor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Mano de obra</p>
            <button type="button" onClick={() => appendLabor({ id: crypto.randomUUID(), service: '', hours: 1, unitPrice: 0 })}
              className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark">
              <Plus size={13} /> Agregar servicio
            </button>
          </div>
          {laborFields.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted border border-dashed border-surface-border rounded-lg">
              Sin servicios — aplica un paquete o agrega manualmente
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-secondary text-xs uppercase text-text-secondary">
                    <th className="px-3 py-2 text-left font-medium">Servicio</th>
                    <th className="px-3 py-2 text-right font-medium w-20">Horas</th>
                    <th className="px-3 py-2 text-right font-medium w-28">Precio/hr</th>
                    <th className="px-3 py-2 text-right font-medium w-24">Total</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {laborFields.map((field, i) => {
                    const h = laborItems[i]?.hours || 0
                    const p = laborItems[i]?.unitPrice || 0
                    return (
                      <tr key={field.id} className="border-b border-surface-border">
                        <td className="px-3 py-2">
                          <input {...register(`laborItems.${i}.service`)} placeholder="Descripción del servicio" className={inputCls} />
                        </td>
                        <td className="px-3 py-2">
                          <Controller name={`laborItems.${i}.hours`} control={control}
                            render={({ field: f }) => (
                              <input type="number" min={0} step={0.5} value={f.value || ''} onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                                className={`${inputCls} text-right`} />
                            )} />
                        </td>
                        <td className="px-3 py-2">
                          <Controller name={`laborItems.${i}.unitPrice`} control={control}
                            render={({ field: f }) => (
                              <input type="number" min={0} value={f.value || ''} onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                                className={`${inputCls} text-right`} />
                            )} />
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-text-primary whitespace-nowrap">
                          {formatCurrency(h * p)}
                        </td>
                        <td className="px-2 py-2">
                          <button type="button" onClick={() => removeLabor(i)} className="text-text-muted hover:text-status-danger">
                            <Trash2 size={14} />
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

        {/* Parts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Refacciones</p>
          </div>
          {partFields.length > 0 && (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-secondary text-xs uppercase text-text-secondary">
                    <th className="px-3 py-2 text-left font-medium">Refacción</th>
                    <th className="px-3 py-2 text-right font-medium w-20">Cant.</th>
                    <th className="px-3 py-2 text-right font-medium w-28">Precio</th>
                    <th className="px-3 py-2 text-center font-medium w-24">Stock</th>
                    <th className="px-3 py-2 text-right font-medium w-24">Total</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {partFields.map((field, i) => {
                    const qty = partItems[i]?.quantity || 0
                    const price = partItems[i]?.unitPrice || 0
                    const avail = partItems[i]?.availableStock
                    return (
                      <tr key={field.id} className="border-b border-surface-border">
                        <td className="px-3 py-2">
                          <p className="text-sm font-medium text-text-primary">{partItems[i]?.name}</p>
                          {partItems[i]?.sku && <p className="text-xs text-text-muted">{partItems[i].sku}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <Controller name={`partItems.${i}.quantity`} control={control}
                            render={({ field: f }) => (
                              <input type="number" min={1} value={f.value || ''} onChange={(e) => f.onChange(parseInt(e.target.value) || 1)}
                                className={`${inputCls} text-right`} />
                            )} />
                        </td>
                        <td className="px-3 py-2">
                          <Controller name={`partItems.${i}.unitPrice`} control={control}
                            render={({ field: f }) => (
                              <input type="number" min={0} value={f.value || ''} onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                                className={`${inputCls} text-right`} />
                            )} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {avail !== undefined && <StockBadge stock={avail} quantity={qty} />}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-text-primary whitespace-nowrap">
                          {formatCurrency(qty * price)}
                        </td>
                        <td className="px-2 py-2">
                          <button type="button" onClick={() => removePart(i)} className="text-text-muted hover:text-status-danger">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Part search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              value={partSearch}
              onChange={(e) => { setPartSearch(e.target.value); setShowPartDropdown(e.target.value.length >= 2) }}
              onFocus={() => partSearch.length >= 2 && setShowPartDropdown(true)}
              onBlur={() => setTimeout(() => setShowPartDropdown(false), 150)}
              placeholder="Buscar refacción por nombre o SKU…"
              className="w-full rounded-lg border border-dashed border-brand/40 bg-brand/5 pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            {showPartDropdown && filteredParts.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full rounded-lg border border-surface-border bg-white shadow-lg overflow-hidden">
                {filteredParts.map((p) => (
                  <button key={p.id} type="button" onMouseDown={() => addPart(p)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-secondary text-left">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-muted">{p.sku} · {p.brand}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-text-primary">{formatCurrency(p.price)}</p>
                      <StockBadge stock={p.stock} quantity={1} />
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showPartDropdown && filteredParts.length === 0 && partSearch.length >= 2 && (
              <div className="absolute z-20 top-full mt-1 w-full rounded-lg border border-surface-border bg-white shadow-sm px-4 py-3">
                <p className="text-sm text-text-muted">No encontrada. Puedes agregarla manualmente.</p>
                <button type="button" onMouseDown={() => {
                  appendPart({ id: crypto.randomUUID(), name: partSearch, sku: '', quantity: 1, unitPrice: 0 })
                  setPartSearch('')
                  setShowPartDropdown(false)
                }} className="mt-1 flex items-center gap-1.5 text-sm text-brand font-medium hover:underline">
                  <Plus size={13} /> Agregar "{partSearch}" manualmente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="font-medium text-text-primary">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span>Descuento / Promociones</span>
              <div className="flex items-center gap-2">
                <Controller name="discount" control={control}
                  render={({ field }) => (
                    <input type="number" min={0} max={100} value={field.value || 0}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="w-16 rounded border border-surface-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                  )} />
                <span>%</span>
                <span className="font-medium text-status-danger">-{formatCurrency(discountAmount)}</span>
              </div>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>IVA (16%)</span>
              <span className="font-medium text-text-primary">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-surface-border pt-3 text-base font-bold text-text-primary">
              <span>Total</span>
              <span className="text-brand">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

      </div>
    </SectionCard>
  )
}
