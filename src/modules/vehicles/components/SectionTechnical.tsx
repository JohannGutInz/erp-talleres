import { useFormContext, Controller } from 'react-hook-form'
import { Wrench } from 'lucide-react'
import type { VehicleFormValues } from '@/types/vehicle-form.types'
import { CYLINDER_OPTIONS, DRIVE_TYPES } from '@/types/vehicle-form.types'
import { VehicleSectionCard } from './VehicleSectionCard'

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

export function SectionTechnical() {
  const { register, control } = useFormContext<VehicleFormValues>()

  return (
    <VehicleSectionCard icon={Wrench} title="Información técnica" subtitle="Motor, tracción y datos de flotilla" collapsible defaultOpen={true}>
      <div className="mt-5 space-y-5">

        {/* Engine + Cylinders + Drive type */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Motor</label>
            <input {...register('engine')} placeholder="2.5L, 1.6T, V6…" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Cilindros</label>
            <Controller name="cylinders" control={control} render={({ field }) => (
              <div className="flex flex-wrap gap-1.5">
                {CYLINDER_OPTIONS.map((c) => (
                  <button key={c} type="button" onClick={() => field.onChange(field.value === c ? '' : c)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${field.value === c ? 'bg-brand text-white border-brand' : 'border-surface-border text-text-secondary hover:border-brand/30 hover:bg-surface-secondary'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipo de tracción</label>
            <Controller name="driveType" control={control} render={({ field }) => (
              <div className="flex flex-wrap gap-1.5">
                {DRIVE_TYPES.map((d) => (
                  <button key={d} type="button" onClick={() => field.onChange(field.value === d ? '' : d)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${field.value === d ? 'bg-brand text-white border-brand' : 'border-surface-border text-text-secondary hover:border-brand/30 hover:bg-surface-secondary'}`}>
                    {d}
                  </button>
                ))}
              </div>
            )} />
          </div>
        </div>

        {/* Flotilla / Economic number */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
            Número económico
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-text-muted">Flotillas</span>
          </label>
          <input {...register('economicNumber')} placeholder="Ej. ECO-042" className="w-64 rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors" />
        </div>

        {/* Insurance */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Datos de seguro</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Aseguradora</label>
              <input {...register('insurer')} placeholder="GNP, AXA, Qualitas…" className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Vigencia</label>
              <input {...register('insuranceExpiry')} type="date" className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Número de póliza</label>
              <input {...register('policyNumber')} placeholder="POL-000000" className={`${input} font-mono`} />
            </div>
          </div>
        </div>
      </div>
    </VehicleSectionCard>
  )
}
