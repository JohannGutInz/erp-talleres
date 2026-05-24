import { useFormContext } from 'react-hook-form'
import { Plus, Car, AlertTriangle } from 'lucide-react'
import type { Client, Vehicle } from '@/types/client.types'
import type { QuoteFormValues } from '@/types/quote.types'
import { MOCK_VEHICLES } from '@/lib/mock-data'
import { SectionCard } from './SectionCard'

function getAllVehicles(): Vehicle[] {
  try {
    const stored = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]') as Array<{
      id: string; clientId: string; clientName?: string; brand: string; model: string
      year?: number; plate: string; vin?: string; color?: string; mileage?: number
      engine?: string; transmission?: string; createdAt: string
    }>
    const mapped: Vehicle[] = stored.map((v) => ({
      id: v.id, clientId: v.clientId, clientName: v.clientName,
      brand: v.brand, model: v.model, year: v.year ?? new Date().getFullYear(),
      plate: v.plate, vin: v.vin, color: v.color, mileage: v.mileage,
      engine: v.engine, transmission: v.transmission, createdAt: v.createdAt,
    }))
    return [...MOCK_VEHICLES, ...mapped]
  } catch { return MOCK_VEHICLES }
}

interface Props {
  foundClient: Client | null
  vehicleMode: 'select' | 'new'
  selectedVehicleId: string | null
  onVehicleSelect: (vehicle: Vehicle) => void
  onVehicleModeChange: (mode: 'select' | 'new') => void
}

const inputCls =
  'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand'

const TRANSMISSIONS = ['', 'Manual', 'Automática', 'CVT', 'Otra']
const currentYear = new Date().getFullYear()

export function SectionVehicle({ foundClient, vehicleMode, selectedVehicleId, onVehicleSelect, onVehicleModeChange }: Props) {
  const { register, setValue, watch, formState: { errors } } = useFormContext<QuoteFormValues>()

  const allVehicles = getAllVehicles()
  const clientVehicles = foundClient
    ? allVehicles.filter((v) => v.clientId === foundClient.id)
    : []

  const plateValue = watch('vehiclePlate')
  const vinValue = watch('vehicleVin')
  const vehicleBrand = watch('vehicleBrand')
  const vehicleModel = watch('vehicleModel')
  const vehicleYear = watch('vehicleYear')
  const vehiclePlate = watch('vehiclePlate')
  const vehicleColor = watch('vehicleColor')

  const isDuplicatePlate =
    vehicleMode === 'new' &&
    plateValue?.length >= 3 &&
    allVehicles.some((v) => v.plate.toLowerCase() === plateValue.toLowerCase() && v.id !== selectedVehicleId)

  const isDuplicateVin =
    vehicleMode === 'new' &&
    (vinValue?.length ?? 0) >= 5 &&
    allVehicles.some((v) => v.vin && v.vin.toLowerCase() === vinValue.toLowerCase() && v.id !== selectedVehicleId)

  function handleVehicleSelect(v: Vehicle) {
    setValue('vehicleId', v.id)
    setValue('vehiclePlate', v.plate)
    setValue('vehicleVin', v.vin ?? '')
    setValue('vehicleBrand', v.brand)
    setValue('vehicleModel', v.model)
    setValue('vehicleYear', v.year)
    setValue('vehicleKm', v.mileage)
    setValue('vehicleColor', v.color ?? '')
    setValue('vehicleEngine', v.engine ?? '')
    setValue('vehicleTransmission', v.transmission ?? '')
    onVehicleSelect(v)
  }

  function handleNewVehicle() {
    setValue('vehicleId', '')
    setValue('vehiclePlate', '')
    setValue('vehicleVin', '')
    setValue('vehicleBrand', '')
    setValue('vehicleModel', '')
    setValue('vehicleYear', currentYear)
    setValue('vehicleKm', undefined)
    setValue('vehicleColor', '')
    setValue('vehicleEngine', '')
    setValue('vehicleTransmission', '')
    onVehicleModeChange('new')
  }

  const showForm = vehicleMode === 'new' || clientVehicles.length === 0

  return (
    <SectionCard number={3} title="Vehículo" subtitle="Selecciona o registra la unidad">
      <div className="space-y-5">
        {/* Existing vehicles grid */}
        {clientVehicles.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Vehículos de {foundClient?.name}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {clientVehicles.map((v) => {
                const isSelected = selectedVehicleId === v.id && vehicleMode === 'select'
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVehicleSelect(v)}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-brand bg-brand-light'
                        : 'border-surface-border hover:border-brand/40 hover:bg-surface-secondary'
                    }`}
                  >
                    <Car size={16} className={`mt-0.5 shrink-0 ${isSelected ? 'text-brand' : 'text-text-muted'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {v.brand} {v.model} {v.year}
                      </p>
                      <p className="text-xs text-text-muted">{v.plate}{v.color ? ` · ${v.color}` : ''}</p>
                      {v.lastService && (
                        <p className="text-xs text-text-muted">Últ. servicio: {v.lastService}</p>
                      )}
                    </div>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={handleNewVehicle}
                className={`flex items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm font-medium transition-all ${
                  vehicleMode === 'new'
                    ? 'border-brand text-brand bg-brand-light'
                    : 'border-surface-border text-text-muted hover:border-brand/40 hover:text-brand'
                }`}
              >
                <Plus size={15} /> Nuevo vehículo
              </button>
            </div>
          </div>
        )}

        {/* Selected vehicle summary (when a client vehicle is selected) */}
        {vehicleMode === 'select' && selectedVehicleId && clientVehicles.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand-light px-4 py-3">
            <Car size={16} className="text-brand shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {vehicleBrand} {vehicleModel} {vehicleYear}
              </p>
              <p className="text-xs text-text-muted">{vehiclePlate}{vehicleColor ? ` · ${vehicleColor}` : ''}</p>
            </div>
          </div>
        )}

        {/* Vehicle form — only shown when creating new or no client vehicles */}
        {showForm && (
          <div className="space-y-4">
            {vehicleMode === 'new' && clientVehicles.length > 0 && (
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Datos del nuevo vehículo</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Placas <span className="text-status-danger">*</span>
                </label>
                <input {...register('vehiclePlate')} placeholder="ABC-123-A"
                  className={`${inputCls} uppercase`} />
                {errors.vehiclePlate && <p className="mt-1 text-xs text-status-danger">{errors.vehiclePlate.message}</p>}
                {isDuplicatePlate && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-600"><AlertTriangle size={12} /> Placa ya registrada</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">VIN / No. serie</label>
                <input {...register('vehicleVin')} placeholder="17 caracteres"
                  className={`${inputCls} uppercase`} />
                {isDuplicateVin && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-600"><AlertTriangle size={12} /> VIN ya registrado</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Marca <span className="text-status-danger">*</span>
                </label>
                <input {...register('vehicleBrand')} placeholder="Toyota, Nissan, Ford…" className={inputCls} />
                {errors.vehicleBrand && <p className="mt-1 text-xs text-status-danger">{errors.vehicleBrand.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Modelo <span className="text-status-danger">*</span>
                </label>
                <input {...register('vehicleModel')} placeholder="Camry, Altima, F-150…" className={inputCls} />
                {errors.vehicleModel && <p className="mt-1 text-xs text-status-danger">{errors.vehicleModel.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Año <span className="text-status-danger">*</span>
                </label>
                <input {...register('vehicleYear', { valueAsNumber: true })} type="number"
                  placeholder={String(currentYear)} min={1950} max={currentYear + 1} className={inputCls} />
                {errors.vehicleYear && <p className="mt-1 text-xs text-status-danger">{errors.vehicleYear.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Kilometraje</label>
                <input {...register('vehicleKm', { valueAsNumber: true })} type="number"
                  placeholder="Km actuales" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Color</label>
                <input {...register('vehicleColor')} placeholder="Blanco, negro, rojo…" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Motor</label>
                <input {...register('vehicleEngine')} placeholder="2.5L, 1.6T, V6…" className={inputCls} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-text-secondary mb-1">Transmisión</label>
                <select {...register('vehicleTransmission')} className={inputCls}>
                  {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t || '— Seleccionar —'}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
