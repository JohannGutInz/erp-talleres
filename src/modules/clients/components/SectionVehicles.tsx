import { useState, useEffect } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Car, Plus, Trash2, ChevronDown, AlertTriangle, Pencil } from 'lucide-react'
import type { ClientFormValues } from '@/types/client-form.types'
import type { VehicleFormValues } from '@/types/vehicle-form.types'
import { ClientSectionCard } from './ClientSectionCard'

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

const currentYear = new Date().getFullYear()

// ── Stored vehicle type ────────────────────────────────────────────
interface StoredVehicle extends VehicleFormValues {
  id: string
  createdAt: string
}

function loadLinked(clientId: string): StoredVehicle[] {
  try {
    const list: StoredVehicle[] = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
    return list.filter((v) => v.clientId === clientId)
  } catch { return [] }
}

// ── Inline vehicle card (new-client mode) ─────────────────────────
function InlineVehicleCard({ index, onRemove }: { index: number; onRemove: () => void }) {
  const [open, setOpen] = useState(true)
  const { register, watch, formState: { errors } } = useFormContext<ClientFormValues>()

  const brand = watch(`vehicles.${index}.brand`)
  const model = watch(`vehicles.${index}.model`)
  const year  = watch(`vehicles.${index}.year`)
  const plate = watch(`vehicles.${index}.plate`)

  const errs = errors.vehicles?.[index]
  const hasErr = !!(errs?.plate || errs?.brand || errs?.model)

  return (
    <div className={`rounded-xl border transition-colors ${hasErr ? 'border-red-200 bg-red-50/30' : 'border-surface-border bg-white'}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-surface-secondary/40 transition-colors rounded-xl"
        onClick={() => setOpen((v) => !v)}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Car size={14} className="text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {[brand, model, year].filter(Boolean).join(' ') || 'Vehículo nuevo'}
          </p>
          <p className="text-xs text-text-muted">{plate || 'Sin placa'}</p>
        </div>
        {hasErr && <AlertTriangle size={14} className="text-status-danger shrink-0" />}
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
        <ChevronDown size={14} className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-surface-border/60 grid grid-cols-3 gap-3">
          {[
            { field: `vehicles.${index}.plate` as const,   label: 'Placas *',       placeholder: 'ABC-123-A', cls: 'uppercase' },
            { field: `vehicles.${index}.brand` as const,   label: 'Marca *',        placeholder: 'Toyota'                      },
            { field: `vehicles.${index}.model` as const,   label: 'Modelo *',       placeholder: 'Camry'                       },
          ].map(({ field, label, placeholder, cls }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
              <input {...register(field)} placeholder={placeholder} className={`${input} text-xs ${cls ?? ''}`} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Año</label>
            <input {...register(`vehicles.${index}.year`, { valueAsNumber: true })}
              type="number" min={1900} max={currentYear + 1} placeholder={String(currentYear)}
              className={`${input} text-xs`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Kilometraje</label>
            <input {...register(`vehicles.${index}.mileage`, { valueAsNumber: true })}
              type="number" min={0} placeholder="km actuales" className={`${input} text-xs`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">VIN</label>
            <input {...register(`vehicles.${index}.vin`)} placeholder="17 caracteres"
              className={`${input} uppercase text-xs`} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Linked vehicle card (edit-client mode) ────────────────────────
function LinkedVehicleCard({ vehicle, onDelete }: { vehicle: StoredVehicle; onDelete: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-white px-4 py-3 hover:border-brand/20 hover:bg-surface-secondary/30 transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Car size={14} className="text-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {vehicle.brand} {vehicle.model} {vehicle.year ?? ''}
        </p>
        <p className="text-xs text-text-muted">
          {vehicle.plate}
          {vehicle.color ? ` · ${vehicle.color}` : ''}
          {vehicle.mileage ? ` · ${vehicle.mileage.toLocaleString('es-MX')} km` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
          className="rounded-lg p-1.5 text-text-muted hover:bg-brand/10 hover:text-brand transition-colors" title="Editar vehículo">
          <Pencil size={13} />
        </button>
        <button type="button" onClick={onDelete}
          className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
interface Props {
  existingClientId?: string
  clientName?: string
}

export function SectionVehicles({ existingClientId, clientName }: Props) {
  const navigate = useNavigate()
  const { control, watch } = useFormContext<ClientFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'vehicles' })

  // Edit mode: linked vehicles from vehicles_list
  const [linked, setLinked] = useState<StoredVehicle[]>(() =>
    existingClientId ? loadLinked(existingClientId) : []
  )

  useEffect(() => {
    if (!existingClientId) return
    function refresh() { setLinked(loadLinked(existingClientId!)) }
    window.addEventListener('vehicle:created', refresh)
    window.addEventListener('vehicle:updated', refresh)
    return () => {
      window.removeEventListener('vehicle:created', refresh)
      window.removeEventListener('vehicle:updated', refresh)
    }
  }, [existingClientId])

  function handleDeleteLinked(vehicleId: string) {
    const vList: StoredVehicle[] = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
    const updated = vList.filter((v) => v.id !== vehicleId)
    localStorage.setItem('vehicles_list', JSON.stringify(updated))
    const remaining = updated.filter((v) => v.clientId === existingClientId)
    setLinked(remaining)
    // Sync vehicleCount on the client
    if (existingClientId) {
      const cList = JSON.parse(localStorage.getItem('clients_list') ?? '[]')
      localStorage.setItem('clients_list', JSON.stringify(
        cList.map((c: { id: string }) =>
          c.id === existingClientId ? { ...c, vehicleCount: remaining.length } : c
        )
      ))
      window.dispatchEvent(new CustomEvent('client:updated', { detail: { id: existingClientId } }))
    }
  }

  // Inline (new client) vehicle count for badge
  const inlineCount = watch('vehicles')?.length ?? 0
  const displayCount = existingClientId ? linked.length : inlineCount

  return (
    <ClientSectionCard
      icon={Car}
      title="Vehículos asociados"
      subtitle="Unidades registradas para este cliente"
      collapsible
      defaultOpen={true}
      badge={
        displayCount > 0
          ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-text-secondary">{displayCount}</span>
          : undefined
      }
    >
      <div className="mt-5 space-y-3">
        {existingClientId ? (
          // ── Edit mode: show vehicles from vehicles_list ──
          <>
            {linked.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
                  <Car size={18} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">Sin vehículos registrados</p>
                  <p className="text-xs text-text-muted mt-0.5">Usa el botón de abajo para agregar el primer vehículo</p>
                </div>
              </div>
            ) : (
              linked.map((v) => (
                <LinkedVehicleCard key={v.id} vehicle={v} onDelete={() => handleDeleteLinked(v.id)} />
              ))
            )}
            <button type="button"
              onClick={() => navigate(`/vehicles/new?clientId=${existingClientId}&clientName=${encodeURIComponent(clientName ?? '')}`)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border py-3 text-sm font-medium text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand/3 transition-colors">
              <Plus size={15} /> Registrar vehículo
            </button>
          </>
        ) : (
          // ── New client mode: inline form ──
          <>
            {fields.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
                  <Car size={18} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">Sin vehículos</p>
                  <p className="text-xs text-text-muted mt-0.5">Puedes agregar vehículos ahora o después</p>
                </div>
              </div>
            ) : (
              fields.map((field, i) => (
                <InlineVehicleCard key={field.id} index={i} onRemove={() => remove(i)} />
              ))
            )}
            <button type="button"
              onClick={() => append({ id: crypto.randomUUID(), plate: '', brand: '', model: '', year: undefined, vin: '', mileage: undefined })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border py-3 text-sm font-medium text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand/3 transition-colors">
              <Plus size={15} /> Agregar vehículo
            </button>
          </>
        )}
      </div>
    </ClientSectionCard>
  )
}
