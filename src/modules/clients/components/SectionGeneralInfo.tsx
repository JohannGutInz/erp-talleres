import { useEffect, useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { User, Building2, Star, AlertTriangle } from 'lucide-react'
import type { ClientFormValues } from '@/types/client-form.types'
import { MOCK_CLIENTS } from '@/lib/mock-data'
import { ClientSectionCard } from './ClientSectionCard'

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors disabled:bg-surface-secondary disabled:cursor-not-allowed'

export function SectionGeneralInfo() {
  const { register, watch, control, formState: { errors } } = useFormContext<ClientFormValues>()
  const [dupClient, setDupClient] = useState<string | null>(null)

  const clientType = watch('clientType')
  const phone = watch('phone')

  useEffect(() => {
    if (!phone || phone.length < 10) { setDupClient(null); return }
    const t = setTimeout(() => {
      const found = MOCK_CLIENTS.find((c) => c.phone === phone)
      setDupClient(found ? found.name : null)
    }, 400)
    return () => clearTimeout(t)
  }, [phone])

  return (
    <ClientSectionCard icon={User} title="Información general" subtitle="Datos principales del cliente">
      <div className="mt-5 space-y-5">
        {/* Type selector */}
        <Controller
          name="clientType"
          control={control}
          render={({ field }) => (
            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Tipo de cliente</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'fisica', label: 'Persona física', icon: User, desc: 'Individual, uso personal' },
                  { value: 'empresa', label: 'Empresa', icon: Building2, desc: 'Negocio o razón social' },
                ] as const).map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                      field.value === value
                        ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                        : 'border-surface-border hover:border-brand/30 hover:bg-surface-secondary/50'
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${field.value === value ? 'bg-brand/10' : 'bg-surface-secondary'}`}>
                      <Icon size={14} className={field.value === value ? 'text-brand' : 'text-text-muted'} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${field.value === value ? 'text-brand' : 'text-text-primary'}`}>{label}</p>
                      <p className="text-xs text-text-muted">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {clientType === 'empresa' ? 'Razón social' : 'Nombre completo'} <span className="text-status-danger">*</span>
          </label>
          <input {...register('name')} placeholder={clientType === 'empresa' ? 'Nombre de la empresa' : 'Nombre y apellidos'} className={input} />
          {errors.name && <p className="mt-1.5 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.name.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Teléfono principal <span className="text-status-danger">*</span>
          </label>
          <input {...register('phone')} type="tel" placeholder="10 dígitos" className={input} />
          {errors.phone && <p className="mt-1.5 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.phone.message}</p>}
          {dupClient && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">Ya existe un cliente con este número: <strong>{dupClient}</strong></p>
            </div>
          )}
        </div>

        {/* Email + Company */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
            <input {...register('email')} type="email" placeholder="correo@ejemplo.com" className={input} />
            {errors.email && <p className="mt-1.5 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Empresa</label>
            <input {...register('company')} placeholder="Nombre de la empresa" className={input} />
          </div>
        </div>

        {/* Frequent toggle */}
        <Controller
          name="isFrequent"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                field.value ? 'border-amber-300 bg-amber-50' : 'border-surface-border hover:bg-surface-secondary/40'
              }`}
            >
              <Star size={15} className={field.value ? 'text-amber-500 fill-amber-400' : 'text-text-muted'} />
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${field.value ? 'text-amber-700' : 'text-text-primary'}`}>Cliente frecuente</p>
                <p className="text-xs text-text-muted">Aparece destacado en búsquedas y reportes</p>
              </div>
              <div className={`h-5 w-9 rounded-full transition-colors ${field.value ? 'bg-amber-400' : 'bg-surface-border'}`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${field.value ? 'translate-x-4' : 'translate-x-0'} border border-surface-border`} />
              </div>
            </button>
          )}
        />
      </div>
    </ClientSectionCard>
  )
}
