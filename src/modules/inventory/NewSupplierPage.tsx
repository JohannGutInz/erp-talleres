import { useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Truck, ArrowRight, Pencil, Plus, User, FileText, Clock } from 'lucide-react'
import type { Supplier } from '@/types/inventory.types'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSection } from '@/components/ui/FormSection'
import { formatCurrency } from '@/lib/utils'

const supplierFormSchema = z.object({
  name:        z.string().min(2, 'Nombre requerido'),
  contact:     z.string().optional(),
  phone:       z.string().optional(),
  email:       z.string().email('Email inválido').optional().or(z.literal('')),
  rfc:         z.string().optional(),
  address:     z.string().optional(),
  city:        z.string().optional(),
  creditDays:  z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().min(0).optional()),
  notes:       z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

const input = 'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

const CREDIT_DAYS_OPTIONS = [0, 8, 15, 30, 45, 60, 90]

export default function NewSupplierPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const isEdit   = !!id

  const stored = useMemo((): SupplierFormValues | null => {
    if (!id) return null
    try {
      const list: Supplier[] = JSON.parse(localStorage.getItem('suppliers_list') ?? '[]')
      const found = list.find((s) => s.id === id)
      if (!found) return null
      const { id: _id, balance: _b, createdAt: _ca, ...vals } = found
      return vals as SupplierFormValues
    } catch { return null }
  }, [id])

  const { register, watch, setValue, handleSubmit, formState: { isSubmitting, errors } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: stored ?? { name: '', contact: '', phone: '', email: '', rfc: '', address: '', city: '', creditDays: 30, notes: '' },
  })

  useEffect(() => {
    if (isEdit && stored === null) navigate('/inventory/suppliers', { replace: true })
  }, [isEdit, stored, navigate])

  const name       = watch('name')
  const creditDays = watch('creditDays')
  const hasErrors  = Object.keys(errors).length > 0

  // get current balance when editing
  const currentBalance = useMemo(() => {
    if (!id) return 0
    try {
      const list: Supplier[] = JSON.parse(localStorage.getItem('suppliers_list') ?? '[]')
      return list.find((s) => s.id === id)?.balance ?? 0
    } catch { return 0 }
  }, [id])

  function onSubmit(data: SupplierFormValues) {
    try {
      const list: Supplier[] = JSON.parse(localStorage.getItem('suppliers_list') ?? '[]')
      if (isEdit && id) {
        const updated = list.map((s) => s.id === id ? { ...s, ...data } : s)
        localStorage.setItem('suppliers_list', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('supplier:updated', { detail: { id } }))
      } else {
        const entry: Supplier = { id: `s-${Date.now()}`, ...data, balance: 0, createdAt: new Date().toISOString() }
        localStorage.setItem('suppliers_list', JSON.stringify([entry, ...list]))
        window.dispatchEvent(new CustomEvent('supplier:created', { detail: entry }))
      }
    } catch { /* ignore */ }
    navigate('/inventory/suppliers')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        description={isEdit ? 'Modifica los datos del proveedor' : 'Registra un nuevo proveedor de refacciones'}
        actions={
          <button type="button" onClick={() => navigate('/inventory/suppliers')}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
            <Truck size={14} /> Ver proveedores
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-3 gap-5 items-start pb-24">
        <div className="col-span-2 space-y-5">
          {/* Datos generales */}
          <FormSection icon={User} title="Datos generales" subtitle="Nombre, contacto y datos de comunicación">
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Nombre / Razón social *</label>
                <input {...register('name')} placeholder="Ej: Autopartes Bosch Mexico SA de CV" className={input} />
                {errors.name && <p className="mt-1 text-xs text-status-danger">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Persona de contacto</label>
                <input {...register('contact')} placeholder="Nombre del representante" className={input} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Teléfono</label>
                <input {...register('phone')} type="tel" placeholder="55-1234-5678" className={input} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Correo electrónico</label>
                <input {...register('email')} type="email" placeholder="ventas@proveedor.com" className={input} />
                {errors.email && <p className="mt-1 text-xs text-status-danger">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Ciudad</label>
                <input {...register('city')} placeholder="Ciudad de México, Guadalajara…" className={input} />
              </div>
            </div>
          </FormSection>

          {/* Datos fiscales */}
          <FormSection icon={FileText} title="Datos fiscales" subtitle="RFC y domicilio fiscal" collapsible defaultOpen={false}>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">RFC</label>
                <input {...register('rfc')} placeholder="XXXX000000XXX" className={`${input} uppercase font-mono`} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Domicilio fiscal</label>
                <textarea {...register('address')} rows={2} placeholder="Calle, número, colonia, municipio, estado…" className={`${input} resize-none`} />
              </div>
            </div>
          </FormSection>

          {/* Condiciones comerciales */}
          <FormSection icon={Clock} title="Condiciones comerciales" subtitle="Plazos de pago y notas de negociación">
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Plazo de crédito</label>
                <div className="flex gap-2 flex-wrap">
                  {CREDIT_DAYS_OPTIONS.map((d) => (
                    <button key={d} type="button" onClick={() => setValue('creditDays', d)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${creditDays === d ? 'bg-brand text-white' : 'border border-surface-border bg-white text-text-secondary hover:bg-surface-secondary'}`}>
                      {d === 0 ? 'Contado' : `${d} días`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Notas</label>
                <textarea {...register('notes')} rows={3} placeholder="Descuentos, condiciones especiales, marca exclusiva…" className={`${input} resize-none`} />
              </div>
            </div>
          </FormSection>
        </div>

        {/* Sidebar */}
        <div className="sticky top-5 rounded-2xl border border-surface-border bg-white shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-text-primary">Resumen</p>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/8">
            <Truck size={20} className="text-brand" />
          </div>
          <p className="text-base font-semibold text-text-primary">{name || 'Nuevo proveedor'}</p>
          <div className="space-y-2 text-xs pt-2 border-t border-surface-border">
            <div className="flex justify-between">
              <span className="text-text-muted">Plazo de crédito</span>
              <span className="font-medium">{creditDays ? `${creditDays} días` : 'Contado'}</span>
            </div>
            {isEdit && (
              <div className="flex justify-between">
                <span className="text-text-muted">Saldo pendiente</span>
                <span className={`font-medium ${currentBalance > 0 ? 'text-status-danger' : 'text-status-completed'}`}>
                  {formatCurrency(currentBalance)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-30 -mx-6 border-t border-surface-border bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {hasErrors ? <span className="text-status-danger font-medium">Revisa los campos con errores</span> : 'Los campos con * son obligatorios'}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/inventory/suppliers')}
              className="rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm">
              {isEdit ? <Pencil size={15} /> : <Plus size={15} />}
              {isEdit ? 'Guardar cambios' : 'Registrar proveedor'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
