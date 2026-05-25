import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Car, User, DollarSign, Printer, CheckCircle } from 'lucide-react'
import type { Client, Vehicle } from '@/types/client.types'
import { type QuoteFormValues, quoteFormSchema } from '@/types/quote.types'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionReception } from './components/SectionReception'
import { SectionClient } from './components/SectionClient'
import { SectionVehicle } from './components/SectionVehicle'
import { SectionProblem } from './components/SectionProblem'
import { SectionDiagnosis } from './components/SectionDiagnosis'
import { SectionQuoteItems } from './components/SectionQuoteItems'
import { SectionAuthorization } from './components/SectionAuthorization'
import { QuotePrintPreview } from './components/QuotePrintPreview'

const today = new Date().toISOString().split('T')[0]

const defaultValues: Partial<QuoteFormValues> = {
  clientId: '', clientPhone: '', clientName: '', needsInvoice: false,
  clientEmail: '', clientRfc: '', clientCompany: '', clientAddress: '',
  vehicleId: '', vehiclePlate: '', vehicleVin: '', vehicleBrand: '', vehicleModel: '',
  vehicleYear: new Date().getFullYear(), vehicleColor: '', vehicleEngine: '', vehicleTransmission: '',
  receptionDate: today, advisorId: '', fuelLevel: 4,
  damageFront: '', damageLeft: '', damageRight: '', damageDashboard: '', damageOther: '',
  problemDescription: '',
  symptoms: [],
  issueSince: '',
  diagnosisPreliminary: '', diagnosisPriority: 'Media', diagnosisRequiresScan: false, diagnosisEstimatedTime: '',
  laborItems: [], partItems: [], discount: 0,
  quoteStatus: 'Pendiente', authNotes: '',
}

export default function NewQuotePage() {
  const navigate = useNavigate()
  const [foundClient, setFoundClient] = useState<Client | null>(null)
  const [clientMode, setClientMode] = useState<'searching' | 'found' | 'new'>('searching')
  const [vehicleMode, setVehicleMode] = useState<'select' | 'new'>('new')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [printData, setPrintData] = useState<QuoteFormValues | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const quoteNumber = useRef(`COT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`)

  const methods = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema) as Resolver<QuoteFormValues>,
    defaultValues,
  })

  const { watch, handleSubmit, formState: { isSubmitting } } = methods

  // ── Auto-save: debounce 2s, persists to localStorage + fires custom event ──
  useEffect(() => {
    const subscription = methods.watch(() => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        try {
          const values = methods.getValues()
          localStorage.setItem('quote_draft', JSON.stringify(values))
          window.dispatchEvent(
            new CustomEvent('quote:draft:saved', {
              detail: { key: 'quote_draft', quoteNumber: quoteNumber.current, timestamp: new Date().toISOString() },
            })
          )
          setLastSaved(new Date())
        } catch { /* localStorage no disponible */ }
      }, 2000)
    })
    return () => {
      subscription.unsubscribe()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [methods])

  const clientName = watch('clientName')
  const clientPhone = watch('clientPhone')
  const vehicleBrand = watch('vehicleBrand')
  const vehicleModel = watch('vehicleModel')
  const vehicleYear = watch('vehicleYear')
  const vehiclePlate = watch('vehiclePlate')
  const laborItems = watch('laborItems') ?? []
  const partItems = watch('partItems') ?? []
  const discount = watch('discount') ?? 0
  const quoteStatus = watch('quoteStatus')

  const subtotal =
    laborItems.reduce((s, l) => s + (l.hours || 0) * (l.unitPrice || 0), 0) +
    partItems.reduce((s, p) => s + (p.quantity || 0) * (p.unitPrice || 0), 0)
  const total = (subtotal - subtotal * (discount / 100)) * 1.16

  function handleClientSelect(client: Client) {
    setFoundClient(client)
    setClientMode('found')
    setVehicleMode('select')
    setSelectedVehicle(null)
  }

  function handleClientClear() {
    setFoundClient(null)
    setClientMode('searching')
    setVehicleMode('new')
    setSelectedVehicle(null)
  }

  function handleVehicleSelect(vehicle: Vehicle) {
    setSelectedVehicle(vehicle)
    setVehicleMode('select')
  }

  function handlePrint() {
    const values = methods.getValues()
    setPrintData(values)
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }

  function onSubmit(data: QuoteFormValues) {
    try {
      let resolvedClientId = data.clientId ?? ''

      // ── Sync new client to clients_list ──
      if (!resolvedClientId) {
        const newClientId = `c-${Date.now()}`
        const cList = JSON.parse(localStorage.getItem('clients_list') ?? '[]')
        const newClient = {
          id: newClientId,
          clientType: 'fisica',
          name: data.clientName,
          phone: data.clientPhone,
          email: data.clientEmail ?? '',
          rfc: data.clientRfc ?? '',
          company: data.clientCompany ?? '',
          address: data.clientAddress ?? '',
          isFrequent: false,
          requiresBilling: data.needsInvoice,
          taxName: '', taxRegime: '', taxCfdiUse: '', taxEmail: data.clientEmail ?? '', taxZip: '',
          vehicleCount: 0,
          vehicles: [],
          notes: '',
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('clients_list', JSON.stringify([newClient, ...cList]))
        window.dispatchEvent(new CustomEvent('client:created', { detail: newClient }))
        resolvedClientId = newClientId
      }

      // ── Sync new vehicle to vehicles_list ──
      if (!data.vehicleId) {
        const newVehicleId = `v-${Date.now()}`
        const vList = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
        const newVehicle = {
          id: newVehicleId,
          clientId: resolvedClientId,
          clientName: data.clientName,
          plate: data.vehiclePlate,
          vin: data.vehicleVin ?? '',
          brand: data.vehicleBrand,
          model: data.vehicleModel,
          year: data.vehicleYear,
          color: data.vehicleColor ?? '',
          mileage: data.vehicleKm,
          engine: data.vehicleEngine ?? '',
          transmission: data.vehicleTransmission ?? '',
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('vehicles_list', JSON.stringify([newVehicle, ...vList]))
        window.dispatchEvent(new CustomEvent('vehicle:created', { detail: newVehicle }))

        // Update vehicleCount on the client
        const cList2 = JSON.parse(localStorage.getItem('clients_list') ?? '[]')
        const vList2 = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
        const count = vList2.filter((v: { clientId: string }) => v.clientId === resolvedClientId).length
        localStorage.setItem('clients_list', JSON.stringify(
          cList2.map((c: { id: string }) => c.id === resolvedClientId ? { ...c, vehicleCount: count } : c)
        ))
        window.dispatchEvent(new CustomEvent('client:updated', { detail: { id: resolvedClientId } }))
      }

      const entry = {
        quoteNumber: quoteNumber.current,
        data: { ...data, clientId: resolvedClientId },
        timestamp: new Date().toISOString(),
      }
      const existing = JSON.parse(localStorage.getItem('quotes_list') ?? '[]') as typeof entry[]
      localStorage.setItem('quotes_list', JSON.stringify([entry, ...existing]))
      localStorage.removeItem('quote_draft')
      window.dispatchEvent(new CustomEvent('quote:submitted', { detail: entry }))
    } catch { /* ignore */ }
    navigate('/quotes')
  }

  function savedLabel() {
    if (!lastSaved) return null
    const secs = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
    if (secs < 10) return 'Guardado hace un momento'
    if (secs < 60) return `Guardado hace ${secs}s`
    return `Guardado hace ${Math.floor(secs / 60)}min`
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PageHeader
          title="Nuevo Presupuesto"
          description={`${quoteNumber.current} · ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`}
          actions={
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <CheckCircle size={12} className="text-status-completed" />
                  {savedLabel()}
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate('/quotes')}
                className="rounded-lg border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                Cancelar
              </button>
            </div>
          }
        />

        <div className="mt-5 grid grid-cols-3 gap-5 items-start">
          {/* ── Main sections ── */}
          <div className="col-span-2 space-y-5">
            <SectionReception />
            <SectionClient
              foundClient={foundClient}
              clientMode={clientMode}
              onClientSelect={handleClientSelect}
              onClientClear={handleClientClear}
              onCreateNew={() => setClientMode('new')}
            />
            <SectionVehicle
              foundClient={foundClient}
              vehicleMode={vehicleMode}
              selectedVehicleId={selectedVehicle?.id ?? null}
              onVehicleSelect={handleVehicleSelect}
              onVehicleModeChange={setVehicleMode}
            />
            <SectionProblem />
            <SectionDiagnosis />
            <SectionQuoteItems />
            <SectionAuthorization />

            {/* ── Bottom action bar (below section 7) ── */}
            <div className="flex items-center justify-between rounded-xl border border-surface-border bg-white p-5 shadow-sm">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-lg border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                <Printer size={15} />
                Exportar PDF
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/quotes')}
                  className="rounded-lg border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm"
                >
                  <FileText size={15} />
                  Guardar cotización
                </button>
              </div>
            </div>
          </div>

          {/* ── Sticky summary ── */}
          <div className="sticky top-5 space-y-4">
            <div className="rounded-xl border border-surface-border bg-white shadow-sm p-5 space-y-4">
              <p className="text-sm font-semibold text-text-primary">Resumen</p>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                  <User size={14} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-muted">Cliente</p>
                  {clientName
                    ? <><p className="text-sm font-semibold text-text-primary truncate">{clientName}</p><p className="text-xs text-text-muted">{clientPhone}</p></>
                    : <p className="text-sm text-text-muted italic">Sin seleccionar</p>
                  }
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Car size={14} className="text-text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-muted">Vehículo</p>
                  {vehicleBrand
                    ? <><p className="text-sm font-semibold text-text-primary truncate">{vehicleBrand} {vehicleModel} {vehicleYear}</p><p className="text-xs text-text-muted">{vehiclePlate || '—'}</p></>
                    : <p className="text-sm text-text-muted italic">Sin seleccionar</p>
                  }
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <DollarSign size={14} className="text-status-completed" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Total estimado</p>
                  <p className="text-xl font-bold text-text-primary">{formatCurrency(total)}</p>
                  <p className="text-xs text-text-muted">
                    {laborItems.length} servicio(s) · {partItems.length} refacción(es)
                  </p>
                </div>
              </div>

              <div className="border-t border-surface-border pt-4">
                <p className="text-xs font-medium text-text-muted mb-1.5">Estado</p>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {quoteStatus}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
            >
              <Printer size={14} />
              Exportar PDF
            </button>
          </div>
        </div>
      </form>

      {/* ── Print preview — portal to body, hidden normally, shown via @media print ── */}
      {printData &&
        createPortal(
          <div className="quote-print-preview" style={{ display: 'none' }}>
            <QuotePrintPreview values={printData} quoteNumber={quoteNumber.current} />
          </div>,
          document.body
        )}
    </FormProvider>
  )
}
