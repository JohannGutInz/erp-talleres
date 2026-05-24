import { useFormContext, Controller } from 'react-hook-form'
import { ClipboardCheck, Upload } from 'lucide-react'
import type { VehicleFormValues } from '@/types/vehicle-form.types'
import { CONDITION_OPTIONS, CHECKLIST_EXTERIOR, CHECKLIST_INTERIOR } from '@/types/vehicle-form.types'
import { VehicleSectionCard } from './VehicleSectionCard'

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

const FUEL_LABELS = ['E', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8', 'F']

function ChecklistGroup({
  field,
  items,
  value,
  onChange,
}: {
  field: string
  items: { key: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(key: string) {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, label }) => {
        const checked = value.includes(key)
        return (
          <button key={key} type="button" onClick={() => toggle(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              checked
                ? 'bg-status-completed/10 border-status-completed/40 text-status-completed'
                : 'border-surface-border text-text-muted hover:border-brand/30 hover:text-text-secondary'
            }`}>
            {checked ? '✓ ' : ''}{label}
          </button>
        )
      })}
    </div>
  )
}

export function SectionReceptionState() {
  const { register, watch, control } = useFormContext<VehicleFormValues>()
  const today = new Date().toISOString().split('T')[0]

  return (
    <VehicleSectionCard icon={ClipboardCheck} title="Estado y recepción" subtitle="Inspección visual y condición general del vehículo" collapsible defaultOpen={true}>
      <div className="mt-5 space-y-6">

        {/* Fuel + Condition + Date */}
        <div className="grid grid-cols-3 gap-6 items-start">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Nivel de combustible</label>
            <Controller name="fuelLevel" control={control} render={({ field }) => (
              <div className="flex gap-1">
                {FUEL_LABELS.map((label, i) => (
                  <button key={i} type="button" onClick={() => field.onChange(i)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold border transition-colors ${
                      field.value === i
                        ? 'bg-brand text-white border-brand'
                        : 'border-surface-border text-text-muted hover:border-brand/40'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            )} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Estado general</label>
            <Controller name="generalCondition" control={control} render={({ field }) => (
              <div className="flex gap-2 flex-wrap">
                {CONDITION_OPTIONS.map(({ value, color }) => (
                  <button key={value} type="button"
                    onClick={() => field.onChange(field.value === value ? '' : value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${color} ${field.value === value ? 'ring-2 ring-offset-1' : ''}`}>
                    {value}
                  </button>
                ))}
              </div>
            )} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Fecha de recepción</label>
            <input {...register('receptionDate')} type="date" defaultValue={today} className={input} />
          </div>
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-surface-border bg-surface-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Exterior — en buen estado</p>
            <Controller name="checklistExterior" control={control} render={({ field }) => (
              <ChecklistGroup field="exterior" items={CHECKLIST_EXTERIOR} value={field.value} onChange={field.onChange} />
            )} />
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Interior — en buen estado</p>
            <Controller name="checklistInterior" control={control} render={({ field }) => (
              <ChecklistGroup field="interior" items={CHECKLIST_INTERIOR} value={field.value} onChange={field.onChange} />
            )} />
          </div>
        </div>

        {/* Damage + Valuables */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Daños visibles</label>
            <textarea {...register('visibleDamage')} rows={3} placeholder="Describa rasguños, abolladuras, daños en pintura…"
              className={`${input} resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Objetos de valor</label>
            <textarea {...register('valuableObjects')} rows={3} placeholder="Artículos en el vehículo que se deben resguardar…"
              className={`${input} resize-none`} />
          </div>
        </div>

        {/* Photos placeholder */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Fotos del vehículo</label>
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-surface-border bg-surface-secondary/30 py-8 transition-colors hover:border-brand/30 hover:bg-brand/3 cursor-pointer">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
                <Upload size={18} className="text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-secondary">Arrastra fotos aquí o haz clic</p>
              <p className="text-xs text-text-muted">PNG, JPG hasta 10 MB cada una</p>
              <span className="mt-1 rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-muted">Disponible al conectar backend</span>
            </div>
          </div>
        </div>
      </div>
    </VehicleSectionCard>
  )
}
