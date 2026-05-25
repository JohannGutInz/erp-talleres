import { useMemo, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, FormProvider, useFieldArray, useFormContext, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Scissors, ArrowRight, Pencil, Search, X, Plus, Trash2, Package, StickyNote, ToggleLeft, ToggleRight, Clock, DollarSign } from 'lucide-react'
import { type ServiceFormValues, serviceFormSchema, SERVICE_CATEGORIES, type StoredService } from '@/types/service.types'
import type { Part } from '@/types/inventory.types'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSection } from '@/components/ui/FormSection'
import { formatCurrency } from '@/lib/utils'

const input = 'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

// ── Required Parts section ─────────────────────────────────────────
function SectionRequiredParts() {
  const { control, watch } = useFormContext<ServiceFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'requiredParts' })
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Part[]>([])
  const [show, setShow]       = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  function loadParts(): Part[] {
    try { return JSON.parse(localStorage.getItem('parts_list') ?? '[]') } catch { return [] }
  }

  useEffect(() => {
    if (!query) { setResults([]); setShow(false); return }
    const t = setTimeout(() => {
      const all = loadParts()
      const q   = query.toLowerCase()
      setResults(all.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 8))
      setShow(true)
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function outside(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false) }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  const existing = watch('requiredParts') ?? []

  function addPart(p: Part) {
    if (existing.some((e) => e.partId === p.id)) return
    append({ partId: p.id, partName: p.name, sku: p.sku ?? '', quantity: 1 })
    setQuery(''); setShow(false)
  }

  return (
    <FormSection icon={Package} title="Refacciones requeridas" subtitle="Partes que se consumen al ejecutar este servicio">
      <div className="mt-4 space-y-3">
        {/* Part search */}
        <div ref={ref} className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar refacción por nombre o SKU…"
            className={`${input} pl-9 pr-9`} />
          {query && <button type="button" onClick={() => { setQuery(''); setShow(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X size={14} /></button>}
          {show && results.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
              {results.map((p) => (
                <button key={p.id} type="button" onClick={() => addPart(p)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-secondary text-left">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted font-mono">{p.sku} · {p.category}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock > p.minStock ? 'bg-emerald-100 text-emerald-700' : p.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock} uds
                  </span>
                </button>
              ))}
            </div>
          )}
          {show && results.length === 0 && query.length >= 2 && (
            <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg px-4 py-3">
              <p className="text-sm text-text-muted">Sin resultados — agrega la refacción en el catálogo primero</p>
            </div>
          )}
        </div>

        {/* Parts list */}
        {fields.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4 border border-dashed border-surface-border rounded-xl">
            Este servicio no requiere refacciones específicas del catálogo
          </p>
        ) : (
          <div className="rounded-xl border border-surface-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-secondary text-xs text-text-muted uppercase">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Refacción</th>
                  <th className="px-4 py-2 text-left font-medium">SKU</th>
                  <th className="px-4 py-2 text-center font-medium w-24">Cantidad</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => (
                  <RequiredPartRow key={field.id} index={i} onRemove={() => remove(i)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FormSection>
  )
}

function RequiredPartRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { register, watch } = useFormContext<ServiceFormValues>()
  const part = watch(`requiredParts.${index}`)
  return (
    <tr className="border-t border-surface-border/60">
      <td className="px-4 py-2.5">
        <p className="font-medium text-text-primary">{part.partName}</p>
      </td>
      <td className="px-4 py-2.5 font-mono text-xs text-text-muted">{part.sku}</td>
      <td className="px-4 py-2.5">
        <input {...register(`requiredParts.${index}.quantity`, { valueAsNumber: true })}
          type="number" min={1}
          className="w-20 text-center rounded-lg border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand" />
      </td>
      <td className="px-3 py-2.5">
        <button type="button" onClick={onRemove}
          className="rounded-lg p-1 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function NewServicePage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const isEdit   = !!id

  const stored = useMemo((): ServiceFormValues | null => {
    if (!id) return null
    try {
      const list: StoredService[] = JSON.parse(localStorage.getItem('services_list') ?? '[]')
      const found = list.find((s) => s.id === id)
      if (!found) return null
      const { id: _id, usageCount: _uc, createdAt: _ca, updatedAt: _ua, ...vals } = found
      return vals as ServiceFormValues
    } catch { return null }
  }, [id])

  const methods = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema) as Resolver<ServiceFormValues>,
    defaultValues: stored ?? {
      name: '', category: '', description: '', basePrice: undefined,
      estimatedHours: undefined, requiredParts: [], active: true, notes: '',
    },
  })

  useEffect(() => {
    if (isEdit && stored === null) navigate('/services', { replace: true })
  }, [isEdit, stored, navigate])

  const { register, watch, setValue, handleSubmit, formState: { isSubmitting, errors } } = methods
  const active        = watch('active')
  const requiredParts = watch('requiredParts') ?? []
  const basePrice     = watch('basePrice')
  const hasErrors     = Object.keys(errors).length > 0

  function onSubmit(data: ServiceFormValues) {
    try {
      const list: StoredService[] = JSON.parse(localStorage.getItem('services_list') ?? '[]')
      if (isEdit && id) {
        const updated = list.map((s) => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s)
        localStorage.setItem('services_list', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('service:updated', { detail: { id } }))
      } else {
        const entry: StoredService = {
          id: `sv-${Date.now()}`, ...data, usageCount: 0,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }
        localStorage.setItem('services_list', JSON.stringify([entry, ...list]))
        window.dispatchEvent(new CustomEvent('service:created', { detail: entry }))
      }
    } catch { /* ignore */ }
    navigate('/services')
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PageHeader
          title={isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
          description={isEdit ? 'Modifica la información del servicio' : 'Define un servicio del catálogo del taller'}
          actions={
            <button type="button" onClick={() => navigate('/services')}
              className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
              <Scissors size={14} /> Ver servicios
            </button>
          }
        />

        <div className="mt-6 grid grid-cols-3 gap-5 items-start pb-24">
          {/* ── Main form ── */}
          <div className="col-span-2 space-y-5">
            {/* Section 1 – Identificación */}
            <FormSection icon={Scissors} title="Información del servicio" subtitle="Nombre, categoría y descripción">
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Nombre del servicio *</label>
                  <input {...register('name')} placeholder="Ej: Cambio de aceite y filtro" className={input} />
                  {errors.name && <p className="mt-1 text-xs text-status-danger">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Categoría *</label>
                  <select {...register('category')} className={input}>
                    <option value="">— Seleccionar —</option>
                    {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-status-danger">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Estatus</label>
                  <button type="button" onClick={() => setValue('active', !active)}
                    className={`flex items-center gap-2 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors ${active ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-surface-border bg-white text-text-muted hover:bg-surface-secondary'}`}>
                    {active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {active ? 'Activo — visible en cotizaciones' : 'Inactivo — no disponible'}
                  </button>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Descripción</label>
                  <textarea {...register('description')} rows={2} placeholder="Describe brevemente en qué consiste el servicio…" className={`${input} resize-none`} />
                </div>
              </div>
            </FormSection>

            {/* Section 2 – Precio y tiempo */}
            <FormSection icon={DollarSign} title="Precio y tiempo estimado" subtitle="Tarifa base y duración aproximada">
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Precio base (MXN) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input {...register('basePrice', { valueAsNumber: true })} type="number" min={0} step={0.01}
                      placeholder="0.00" className={`${input} pl-7`} />
                  </div>
                  {errors.basePrice && <p className="mt-1 text-xs text-status-danger">{errors.basePrice.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Horas estimadas</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input {...register('estimatedHours', { valueAsNumber: true })} type="number" min={0} step={0.25}
                      placeholder="0.0" className={`${input} pl-9`} />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Section 3 – Required Parts */}
            <SectionRequiredParts />

            {/* Section 4 – Notes */}
            <FormSection icon={StickyNote} title="Notas internas" subtitle="Instrucciones o condiciones especiales del servicio" collapsible defaultOpen={false}>
              <div className="mt-4">
                <textarea {...register('notes')} rows={3} placeholder="Ej: Requiere autorización especial. Solo para vehículos diésel. Incluye garantía de 3 meses…" className={`${input} resize-none`} />
              </div>
            </FormSection>
          </div>

          {/* ── Summary sidebar ── */}
          <div className="sticky top-5 rounded-2xl border border-surface-border bg-white shadow-sm p-5 space-y-4">
            <p className="text-sm font-semibold text-text-primary">Resumen</p>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/8">
                <Scissors size={16} className="text-brand" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Precio base</p>
                <p className="text-xl font-bold text-text-primary">{basePrice ? formatCurrency(basePrice) : '—'}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-surface-border">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Refacciones requeridas</span>
                <span className="font-medium text-text-primary">{requiredParts.length}</span>
              </div>
              {requiredParts.map((p, i) => (
                <div key={i} className="flex justify-between text-xs pl-2">
                  <span className="text-text-secondary truncate max-w-[140px]">{p.partName}</span>
                  <span className="text-text-muted">×{p.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-surface-border">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-secondary text-text-muted'}`}>
                {active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                {active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="sticky bottom-0 z-30 -mx-6 border-t border-surface-border bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {hasErrors ? <span className="text-status-danger font-medium">Revisa los campos con errores</span> : 'Los campos con * son obligatorios'}
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/services')}
                className="rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm">
                {isEdit ? <Pencil size={15} /> : <Plus size={15} />}
                {isEdit ? 'Guardar cambios' : 'Crear servicio'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
