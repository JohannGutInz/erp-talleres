import { useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Car, AlertTriangle } from 'lucide-react'
import type { VehicleFormValues } from '@/types/vehicle-form.types'
import { FUEL_TYPES, TRANSMISSIONS, CAR_COLORS } from '@/types/vehicle-form.types'
import { MOCK_VEHICLES } from '@/lib/mock-data'
import { VehicleSectionCard } from './VehicleSectionCard'

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

const currentYear = new Date().getFullYear()

function loadStoredVehicles(): { plate?: string; vin?: string; id?: string }[] {
  try { return JSON.parse(localStorage.getItem('vehicles_list') ?? '[]') } catch { return [] }
}

export function SectionVehicleInfo({ vehicleId }: { vehicleId?: string }) {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<VehicleFormValues>()

  const plate = watch('plate')
  const vin = watch('vin')
  const color = watch('color')

  const { dupPlate, dupVin } = useMemo(() => {
    const all = [...MOCK_VEHICLES, ...loadStoredVehicles()]
    return {
      dupPlate: !!(plate && plate.length >= 3 && all.some((v) => v.plate?.toLowerCase() === plate.toLowerCase() && v.id !== vehicleId)),
      dupVin:   !!(vin   && vin.length   >= 5 && all.some((v) => v.vin?.toLowerCase()   === vin.toLowerCase()   && v.id !== vehicleId)),
    }
  }, [plate, vin, vehicleId])

  return (
    <VehicleSectionCard icon={Car} title="Información del vehículo" subtitle="Datos de identificación y características">
      <div className="mt-5 space-y-4">

        {/* Plate + VIN */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Placas <span className="text-status-danger">*</span>
            </label>
            <input {...register('plate')} placeholder="ABC-123-A" className={`${input} uppercase tracking-wider`} />
            {errors.plate && <p className="mt-1 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.plate.message}</p>}
            {dupPlate && <p className="mt-1 text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={11} />Este vehículo ya existe</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">VIN / Número de serie</label>
            <input {...register('vin')} placeholder="17 caracteres" className={`${input} uppercase tracking-wider font-mono`} />
            {dupVin && <p className="mt-1 text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={11} />VIN ya registrado</p>}
          </div>
        </div>

        {/* Brand + Model + Submodel */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Marca <span className="text-status-danger">*</span>
            </label>
            <input {...register('brand')} placeholder="Toyota, Nissan…" className={input} />
            {errors.brand && <p className="mt-1 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.brand.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Modelo <span className="text-status-danger">*</span>
            </label>
            <input {...register('model')} placeholder="Camry, Altima…" className={input} />
            {errors.model && <p className="mt-1 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.model.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Submodelo / Versión</label>
            <input {...register('submodel')} placeholder="LE, Sport, Turbo…" className={input} />
          </div>
        </div>

        {/* Year + Mileage + Color */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Año</label>
            <input {...register('year', { valueAsNumber: true })} type="number" min={1900} max={currentYear + 1} placeholder={String(currentYear)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Kilometraje</label>
            <div className="relative">
              <input {...register('mileage', { valueAsNumber: true })} type="number" min={0} placeholder="Km actuales" className={`${input} pr-10`} />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">km</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Color</label>
            <input {...register('color')} placeholder="Blanco, negro…" className={input} />
          </div>
        </div>

        {/* Color swatches */}
        <div className="flex flex-wrap gap-2">
          {CAR_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setValue('color', c.name)}
              title={c.name}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c.name ? 'border-brand ring-2 ring-brand/30 scale-110' : 'border-surface-border'}`}
              style={{ background: c.hex }}
            />
          ))}
        </div>

        {/* Fuel + Transmission */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipo de combustible</label>
            <Controller name="fuelType" control={control} render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPES.map((f) => (
                  <button key={f} type="button" onClick={() => field.onChange(field.value === f ? '' : f)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${field.value === f ? 'bg-brand text-white border-brand' : 'border-surface-border text-text-secondary hover:border-brand/40 hover:bg-surface-secondary'}`}>
                    {f}
                  </button>
                ))}
              </div>
            )} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Transmisión</label>
            <Controller name="transmission" control={control} render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {TRANSMISSIONS.map((t) => (
                  <button key={t} type="button" onClick={() => field.onChange(field.value === t ? '' : t)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${field.value === t ? 'bg-brand text-white border-brand' : 'border-surface-border text-text-secondary hover:border-brand/40 hover:bg-surface-secondary'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )} />
          </div>
        </div>
      </div>
    </VehicleSectionCard>
  )
}
