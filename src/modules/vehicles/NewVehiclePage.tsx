import { useMemo, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, ArrowRight, Pencil } from 'lucide-react'
import { type VehicleFormValues, vehicleFormSchema } from '@/types/vehicle-form.types'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionAssociatedClient } from './components/SectionAssociatedClient'
import { SectionVehicleInfo } from './components/SectionVehicleInfo'
import { SectionTechnical } from './components/SectionTechnical'
import { SectionReceptionState } from './components/SectionReceptionState'
import { SectionVehicleHistory } from './components/SectionVehicleHistory'
import { SectionVehicleNotes } from './components/SectionVehicleNotes'

interface StoredVehicle extends VehicleFormValues {
  id: string
  createdAt: string
}

const today = new Date().toISOString().split('T')[0]

const EMPTY: VehicleFormValues = {
  clientId: '', clientName: '',
  plate: '', vin: '', brand: '', model: '', submodel: '',
  year: undefined, color: '', mileage: undefined,
  fuelType: '', transmission: '',
  engine: '', cylinders: '', driveType: '', economicNumber: '',
  insurer: '', insuranceExpiry: '', policyNumber: '',
  fuelLevel: 4, generalCondition: undefined,
  receptionDate: today,
  visibleDamage: '', valuableObjects: '',
  checklistExterior: [], checklistInterior: [],
  notes: '',
}

export default function NewVehiclePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isEdit = !!id

  const prefilledClientId   = searchParams.get('clientId')   ?? ''
  const prefilledClientName = searchParams.get('clientName') ?? ''

  const stored = useMemo((): VehicleFormValues | null => {
    if (!id) return null
    try {
      const list: StoredVehicle[] = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
      const found = list.find((v) => v.id === id)
      if (!found) return null
      const { id: _id, createdAt: _ca, ...vals } = found
      return vals as VehicleFormValues
    } catch { return null }
  }, [id])

  const methods = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: stored ?? {
      ...EMPTY,
      clientId:   prefilledClientId,
      clientName: prefilledClientName,
    },
  })

  useEffect(() => {
    if (isEdit && stored === null) navigate('/vehicles', { replace: true })
  }, [isEdit, stored, navigate])

  const { handleSubmit, watch, formState: { isSubmitting, errors } } = methods
  const hasErrors = Object.keys(errors).length > 0
  const plate = watch('plate')
  const clientId = watch('clientId')

  function syncClientVehicleCount(clientId: string) {
    if (!clientId) return
    try {
      const vList: StoredVehicle[] = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
      const count = vList.filter((v) => v.clientId === clientId).length
      const cList: { id: string }[] = JSON.parse(localStorage.getItem('clients_list') ?? '[]')
      localStorage.setItem('clients_list', JSON.stringify(
        cList.map((c) => c.id === clientId ? { ...c, vehicleCount: count } : c)
      ))
      window.dispatchEvent(new CustomEvent('client:updated', { detail: { id: clientId } }))
    } catch { /* ignore */ }
  }

  function onSubmit(data: VehicleFormValues) {
    try {
      const list: StoredVehicle[] = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
      if (isEdit && id) {
        const oldVehicle = list.find((v) => v.id === id)
        const updated = list.map((v) => v.id === id ? { ...v, ...data } : v)
        localStorage.setItem('vehicles_list', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('vehicle:updated', { detail: { id } }))
        // Sync old client if clientId changed
        if (oldVehicle?.clientId && oldVehicle.clientId !== data.clientId) {
          syncClientVehicleCount(oldVehicle.clientId)
        }
        if (data.clientId) syncClientVehicleCount(data.clientId)
      } else {
        const entry: StoredVehicle = { id: `v-${Date.now()}`, ...data, createdAt: new Date().toISOString() }
        localStorage.setItem('vehicles_list', JSON.stringify([entry, ...list]))
        window.dispatchEvent(new CustomEvent('vehicle:created', { detail: entry }))
        if (data.clientId) syncClientVehicleCount(data.clientId)
      }
    } catch { /* ignore */ }
    // Navigate back to client edit page if we came from there
    if (!isEdit && prefilledClientId) {
      navigate(`/clients/${prefilledClientId}/edit`)
    } else {
      navigate('/vehicles')
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PageHeader
          title={isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          description={isEdit ? 'Modifica la información del vehículo y guarda los cambios' : 'Registra un nuevo vehículo y asígnalo a un cliente'}
          actions={
            <button type="button" onClick={() => navigate('/vehicles')}
              className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
              <Car size={14} /> Ver vehículos
            </button>
          }
        />

        <div className="mt-6 grid grid-cols-3 gap-5 items-start pb-24">
          {/* ── Main form ── */}
          <div className="col-span-2 space-y-5">
            <SectionAssociatedClient />
            <SectionVehicleInfo vehicleId={id} />
            <SectionTechnical />
            <SectionReceptionState />
            <SectionVehicleNotes />
          </div>

          {/* ── History sidebar ── */}
          <div className="sticky top-5">
            <SectionVehicleHistory plate={plate} clientId={clientId} />
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="sticky bottom-0 z-30 -mx-6 border-t border-surface-border bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {hasErrors
                ? <span className="text-status-danger font-medium">Revisa los campos con errores antes de continuar</span>
                : 'Los campos marcados con * son obligatorios'}
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/vehicles')}
                className="rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm">
                {isEdit ? <Pencil size={15} /> : <Car size={15} />}
                {isEdit ? 'Guardar cambios' : 'Guardar vehículo'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
