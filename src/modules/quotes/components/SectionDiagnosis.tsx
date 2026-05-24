import { useFormContext, Controller } from 'react-hook-form'
import type { QuoteFormValues, DiagnosisPriority } from '@/types/quote.types'
import { SectionCard } from './SectionCard'

const PRIORITIES: { value: DiagnosisPriority; cls: string }[] = [
  { value: 'Baja',    cls: 'border-emerald-200 bg-emerald-50 text-emerald-700 data-[active=true]:border-emerald-400 data-[active=true]:ring-2 data-[active=true]:ring-emerald-200' },
  { value: 'Media',   cls: 'border-amber-200 bg-amber-50 text-amber-700 data-[active=true]:border-amber-400 data-[active=true]:ring-2 data-[active=true]:ring-amber-200' },
  { value: 'Alta',    cls: 'border-orange-200 bg-orange-50 text-orange-700 data-[active=true]:border-orange-400 data-[active=true]:ring-2 data-[active=true]:ring-orange-200' },
  { value: 'Urgente', cls: 'border-red-200 bg-red-50 text-red-700 data-[active=true]:border-red-400 data-[active=true]:ring-2 data-[active=true]:ring-red-200' },
]

export function SectionDiagnosis() {
  const { register, control, watch } = useFormContext<QuoteFormValues>()
  const requiresScan = watch('diagnosisRequiresScan')

  return (
    <SectionCard
      number={5}
      title="Diagnóstico inicial"
      subtitle="Evaluación preliminar del técnico — clic para expandir"
      collapsible
      defaultCollapsed
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Diagnóstico preliminar</label>
          <textarea
            {...register('diagnosisPreliminary')}
            rows={3}
            placeholder="Observaciones iniciales del técnico al inspeccionar el vehículo…"
            className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">Prioridad</p>
          <Controller
            name="diagnosisPriority"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map(({ value, cls }) => (
                  <button
                    key={value}
                    type="button"
                    data-active={field.value === value}
                    onClick={() => field.onChange(value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all ${cls}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-surface-border px-4 py-3 hover:bg-surface-secondary transition-colors">
            <input type="checkbox" {...register('diagnosisRequiresScan')}
              className="h-4 w-4 rounded border-surface-border text-brand focus:ring-brand" />
            <div>
              <p className="text-sm font-medium text-text-primary">Requiere escaneo electrónico</p>
              <p className="text-xs text-text-muted">Scanner OBD / multimarca</p>
            </div>
          </label>
          {requiresScan && (
            <p className="text-xs font-medium text-amber-600">Se agregará cargo por escaneo al cotizar</p>
          )}
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-medium text-text-secondary mb-1">Tiempo estimado de reparación</label>
          <input
            {...register('diagnosisEstimatedTime')}
            placeholder="Ej: 2 horas, 1 día hábil…"
            className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
      </div>
    </SectionCard>
  )
}
