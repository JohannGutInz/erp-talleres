import { useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, FormProvider, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, ArrowRight, Users, Pencil } from 'lucide-react'
import { type ClientFormValues, clientFormSchema } from '@/types/client-form.types'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionGeneralInfo } from './components/SectionGeneralInfo'
import { SectionContact } from './components/SectionContact'
import { SectionBilling } from './components/SectionBilling'
import { SectionVehicles } from './components/SectionVehicles'
import { SectionNotes } from './components/SectionNotes'

interface StoredClient extends ClientFormValues {
  id: string
  vehicleCount: number
  createdAt: string
}

const EMPTY_DEFAULTS: ClientFormValues = {
  clientType: 'fisica',
  name: '',
  phone: '',
  email: '',
  company: '',
  isFrequent: false,
  phone2: '',
  whatsapp: '',
  useMainPhoneAsWhatsapp: false,
  address: '',
  city: '',
  state: '',
  requiresBilling: false,
  rfc: '',
  taxName: '',
  taxRegime: '',
  taxCfdiUse: '',
  taxEmail: '',
  taxZip: '',
  vehicles: [],
  notes: '',
}

export default function NewClientPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const storedClient = useMemo((): ClientFormValues | null => {
    if (!id) return null
    try {
      const list: StoredClient[] = JSON.parse(localStorage.getItem('clients_list') ?? '[]')
      const found = list.find((c) => c.id === id)
      if (!found) return null
      // Extract only form fields (strip id, vehicleCount, createdAt)
      const { id: _id, vehicleCount: _vc, createdAt: _ca, ...formValues } = found
      return formValues as ClientFormValues
    } catch { return null }
  }, [id])

  const methods = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
    defaultValues: storedClient ?? EMPTY_DEFAULTS,
  })

  // Redirect if editing a non-existent client
  useEffect(() => {
    if (isEdit && storedClient === null) navigate('/clients', { replace: true })
  }, [isEdit, storedClient, navigate])

  const { handleSubmit, watch, formState: { isSubmitting, errors } } = methods
  const hasErrors = Object.keys(errors).length > 0
  const clientName = watch('name')

  function onSubmit(data: ClientFormValues) {
    try {
      const list: StoredClient[] = JSON.parse(localStorage.getItem('clients_list') ?? '[]')

      if (isEdit && id) {
        // vehicleCount is authoritative from vehicles_list, not from inline form
        const vList: { clientId: string }[] = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
        const vehicleCount = vList.filter((v) => v.clientId === id).length

        const updated = list.map((c) =>
          c.id === id ? { ...c, ...data, vehicleCount } : c
        )
        localStorage.setItem('clients_list', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('client:updated', { detail: { id } }))
      } else {
        const newId = `c-${Date.now()}`
        // Write inline vehicles to vehicles_list
        if (data.vehicles?.length) {
          const vList = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
          const inlineVehicles = data.vehicles.map((v) => ({
            ...v,
            clientId: newId,
            clientName: data.name,
            createdAt: new Date().toISOString(),
          }))
          localStorage.setItem('vehicles_list', JSON.stringify([...inlineVehicles, ...vList]))
          window.dispatchEvent(new CustomEvent('vehicle:created', { detail: { count: inlineVehicles.length } }))
        }
        const entry: StoredClient = {
          id: newId,
          ...data,
          vehicleCount: data.vehicles?.length ?? 0,
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('clients_list', JSON.stringify([entry, ...list]))
        window.dispatchEvent(new CustomEvent('client:created', { detail: entry }))
      }
    } catch { /* ignore */ }
    navigate('/clients')
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PageHeader
          title={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          description={
            isEdit
              ? 'Modifica la información del cliente y guarda los cambios'
              : 'Completa la información del cliente para registrarlo en el sistema'
          }
          actions={
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
            >
              <Users size={14} />
              Ver clientes
            </button>
          }
        />

        <div className="mt-6 space-y-5 pb-24">
          <SectionGeneralInfo />
          <SectionBilling />
          <SectionVehicles existingClientId={isEdit ? id : undefined} clientName={clientName} />
          <SectionContact />
          <SectionNotes />
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
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm"
              >
                {isEdit ? <Pencil size={15} /> : <UserPlus size={15} />}
                {isEdit ? 'Guardar cambios' : 'Guardar cliente'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
