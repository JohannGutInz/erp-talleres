import { useFormContext, Controller } from 'react-hook-form'
import { Camera } from 'lucide-react'
import type { QuoteFormValues } from '@/types/quote.types'
import { MOCK_ADVISORS } from '@/lib/mock-data'
import { SectionCard } from './SectionCard'

const inputCls =
  'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand'

const FUEL_TICKS = [
  { value: 0, label: 'E' },
  { value: 2, label: '¼' },
  { value: 4, label: '½' },
  { value: 6, label: '¾' },
  { value: 8, label: 'F' },
]

const DAMAGE_AREAS = [
  { field: 'damageFront' as const, label: 'Frente' },
  { field: 'damageLeft' as const, label: 'Lado izquierdo' },
  { field: 'damageRight' as const, label: 'Lado derecho' },
  { field: 'damageDashboard' as const, label: 'Tablero / Interior' },
  { field: 'damageOther' as const, label: 'Otros daños' },
]

export function SectionReception() {
  const { register, control } = useFormContext<QuoteFormValues>()

  return (
    <SectionCard
      number={1}
      title="Recepción rápida"
      subtitle="Estado de la unidad al ingreso — clic para expandir"
      collapsible
      defaultCollapsed
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Fecha de recepción</label>
            <input {...register('receptionDate')} type="date" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Asesor</label>
            <select {...register('advisorId')} className={inputCls}>
              <option value="">— Seleccionar asesor —</option>
              {MOCK_ADVISORS.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Kilometraje de entrada</label>
            <input {...register('entryKm', { valueAsNumber: true })} type="number" placeholder="km al recibir" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nivel de combustible</label>
            <Controller
              name="fuelLevel"
              control={control}
              render={({ field }) => (
                <div className="flex gap-1">
                  {FUEL_TICKS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all border ${
                        field.value === value
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-white text-text-secondary border-surface-border hover:border-brand/40 hover:text-brand'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">Daños visibles (dejar vacío si no hay)</p>
          <div className="grid grid-cols-2 gap-3">
            {DAMAGE_AREAS.map(({ field, label }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
                <input {...register(field)} placeholder="Describir daño…" className={`${inputCls} text-xs py-2`} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-text-secondary mb-2">Fotos de recepción</p>
          <div className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border bg-surface-secondary/50 px-6 py-8 cursor-pointer hover:border-brand/40 transition-colors">
            <Camera size={20} className="text-text-muted" />
            <div className="text-center">
              <p className="text-sm font-medium text-text-secondary">Agregar fotos</p>
              <p className="text-xs text-text-muted">PNG, JPG — máx. 10 MB c/u</p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
