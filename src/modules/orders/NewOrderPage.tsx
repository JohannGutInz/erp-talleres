import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ClipboardList, User, Car, Wrench, Package, StickyNote,
  Search, X, Trash2, Plus, ArrowRight, Pencil, AlertCircle, Clock,
} from 'lucide-react'
import type { Order, OrderService, OrderPart } from '@/types/order.types'
import type { Client } from '@/types/client.types'
import type { Part } from '@/types/inventory.types'
import { MOCK_CLIENTS, MOCK_VEHICLES } from '@/lib/mock-data'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSection } from '@/components/ui/FormSection'
import { formatCurrency } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────

type StoredService = { id: string; name: string; basePrice: number; category: string }
type StoredClient  = Client & { id: string }
type StoredVehicle = { id: string; clientId: string; brand: string; model: string; year?: number; plate: string; mileage?: number }
type StoredPart    = Part

// ── Constants ─────────────────────────────────────────────────────────────

const TECHNICIANS = [
  { id: 't1', name: 'Carlos Hernández' },
  { id: 't2', name: 'Miguel Ángel Soto' },
  { id: 't3', name: 'Jorge Ramírez' },
  { id: 't4', name: 'Luis Espinoza' },
]

const PRIORITIES = ['Normal', 'Alta', 'Urgente'] as const

// ── Schema ────────────────────────────────────────────────────────────────

const orderLineService = z.object({
  serviceId: z.string(),
  name:      z.string(),
  price:     z.number().min(0),
  quantity:  z.number().min(1),
})

const orderLinePart = z.object({
  partId:   z.string(),
  name:     z.string(),
  sku:      z.string(),
  price:    z.number().min(0),
  quantity: z.number().min(1),
})

const orderFormSchema = z.object({
  clientId:      z.string().min(1, 'Selecciona un cliente'),
  clientName:    z.string().min(1, 'Selecciona un cliente'),
  clientPhone:   z.string().optional(),
  vehicleId:     z.string().min(1, 'Selecciona un vehículo'),
  vehiclePlate:  z.string(),
  vehicleLabel:  z.string(),
  vehicleKm:     z.number().optional(),
  technicianId:  z.string().optional(),
  technicianName: z.string().optional(),
  priority:      z.enum(PRIORITIES).default('Normal'),
  promiseDate:   z.string().optional(),
  services:      z.array(orderLineService).default([]),
  parts:         z.array(orderLinePart).default([]),
  notes:         z.string().optional(),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

// ── Helpers ───────────────────────────────────────────────────────────────

const input = 'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

function getAllClients(): StoredClient[] {
  try {
    const stored: StoredClient[] = JSON.parse(localStorage.getItem('clients_list') ?? '[]')
    const mockIds = new Set(MOCK_CLIENTS.map((c) => c.id))
    return [...MOCK_CLIENTS, ...stored.filter((c) => !mockIds.has(c.id))] as StoredClient[]
  } catch { return MOCK_CLIENTS as StoredClient[] }
}

function getClientVehicles(clientId: string): StoredVehicle[] {
  try {
    const stored: StoredVehicle[] = JSON.parse(localStorage.getItem('vehicles_list') ?? '[]')
    const mockV = MOCK_VEHICLES.filter((v) => v.clientId === clientId) as StoredVehicle[]
    const mockIds = new Set(mockV.map((v) => v.id))
    return [...mockV, ...stored.filter((v) => v.clientId === clientId && !mockIds.has(v.id))]
  } catch { return MOCK_VEHICLES.filter((v) => v.clientId === clientId) as StoredVehicle[] }
}

function getAllServices(): StoredService[] {
  try { return JSON.parse(localStorage.getItem('services_list') ?? '[]') } catch { return [] }
}

function getAllParts(): StoredPart[] {
  try { return JSON.parse(localStorage.getItem('parts_list') ?? '[]') } catch { return [] }
}

function nextOrderNumber(): string {
  try {
    const list: Order[] = JSON.parse(localStorage.getItem('orders_list') ?? '[]')
    return `OT-${String(list.length + 42).padStart(4, '0')}`
  } catch { return `OT-${Date.now()}` }
}

const PRIORITY_STYLE: Record<string, string> = {
  Normal:  'border-surface-border bg-white text-text-secondary',
  Alta:    'border-amber-300 bg-amber-50 text-amber-700',
  Urgente: 'border-red-300 bg-red-50 text-red-600',
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function NewOrderPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const isEdit   = !!id

  const stored = useMemo((): OrderFormValues | null => {
    if (!id) return null
    try {
      const list: Order[] = JSON.parse(localStorage.getItem('orders_list') ?? '[]')
      const found = list.find((o) => o.id === id)
      if (!found) return null
      return {
        clientId: found.clientId, clientName: found.clientName, clientPhone: '',
        vehicleId: found.vehicleId, vehiclePlate: found.vehiclePlate,
        vehicleLabel: `${found.vehicleModel} · ${found.vehiclePlate}`,
        technicianId: found.technicianId ?? '', technicianName: found.technicianName ?? '',
        priority: 'Normal', promiseDate: '', notes: found.notes ?? '',
        services: found.services.map((s) => ({ serviceId: s.serviceId, name: s.name, price: s.price, quantity: s.quantity })),
        parts:    found.parts.map((p)    => ({ partId: p.partId, name: p.name, sku: p.sku, price: p.price, quantity: p.quantity })),
        vehicleKm: undefined,
      }
    } catch { return null }
  }, [id])

  const { register, watch, setValue, handleSubmit, control, formState: { isSubmitting, errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema) as Resolver<OrderFormValues>,
    defaultValues: stored ?? {
      clientId: '', clientName: '', clientPhone: '', vehicleId: '', vehiclePlate: '',
      vehicleLabel: '', technicianId: '', technicianName: '', priority: 'Normal',
      promiseDate: '', services: [], parts: [], notes: '',
    },
  })

  useEffect(() => {
    if (isEdit && stored === null) navigate('/orders', { replace: true })
  }, [isEdit, stored, navigate])

  const { fields: serviceFields, append: addService, remove: removeService } = useFieldArray({ control, name: 'services' })
  const { fields: partFields,    append: addPart,    remove: removePart    } = useFieldArray({ control, name: 'parts'    })

  const services   = watch('services')
  const parts      = watch('parts')
  const clientName = watch('clientName')
  const clientId   = watch('clientId')
  const priority   = watch('priority')
  const vehicleLabel = watch('vehicleLabel')

  const totalLabor = services.reduce((s, l) => s + l.price * l.quantity, 0)
  const totalParts = parts.reduce((s, l) => s + l.price * l.quantity, 0)
  const total      = totalLabor + totalParts
  const hasErrors  = Object.keys(errors).length > 0

  // Client search
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState<StoredClient[]>([])
  const [showClients, setShowClients] = useState(false)
  const clientRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!clientQuery) { setClientResults([]); setShowClients(false); return }
    const t = setTimeout(() => {
      const q = clientQuery.toLowerCase()
      setClientResults(getAllClients().filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 6))
      setShowClients(true)
    }, 200)
    return () => clearTimeout(t)
  }, [clientQuery])

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (clientRef.current && !clientRef.current.contains(e.target as Node)) setShowClients(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function selectClient(c: StoredClient) {
    setValue('clientId', c.id)
    setValue('clientName', c.name)
    setValue('clientPhone', c.phone ?? '')
    setValue('vehicleId', '')
    setValue('vehiclePlate', '')
    setValue('vehicleLabel', '')
    setClientQuery(''); setShowClients(false)
  }

  // Vehicle list
  const clientVehicles = clientId ? getClientVehicles(clientId) : []

  function selectVehicle(v: StoredVehicle) {
    setValue('vehicleId', v.id)
    setValue('vehiclePlate', v.plate)
    setValue('vehicleLabel', `${v.brand} ${v.model} ${v.year ?? ''} · ${v.plate}`)
  }

  // Service search
  const [svcQuery, setSvcQuery] = useState('')
  const [svcResults, setSvcResults] = useState<StoredService[]>([])
  const [showSvc, setShowSvc] = useState(false)
  const svcRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svcQuery) { setSvcResults([]); setShowSvc(false); return }
    const t = setTimeout(() => {
      const q = svcQuery.toLowerCase()
      setSvcResults(getAllServices().filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6))
      setShowSvc(true)
    }, 200)
    return () => clearTimeout(t)
  }, [svcQuery])

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (svcRef.current && !svcRef.current.contains(e.target as Node)) setShowSvc(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function pickService(s: StoredService) {
    if (services.some((l) => l.serviceId === s.id)) return
    addService({ serviceId: s.id, name: s.name, price: s.basePrice, quantity: 1 })
    setSvcQuery(''); setShowSvc(false)
  }

  // Part search
  const [partQuery, setPartQuery] = useState('')
  const [partResults, setPartResults] = useState<StoredPart[]>([])
  const [showParts, setShowParts] = useState(false)
  const partRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!partQuery) { setPartResults([]); setShowParts(false); return }
    const t = setTimeout(() => {
      const q = partQuery.toLowerCase()
      setPartResults(getAllParts().filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 6))
      setShowParts(true)
    }, 200)
    return () => clearTimeout(t)
  }, [partQuery])

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (partRef.current && !partRef.current.contains(e.target as Node)) setShowParts(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function pickPart(p: StoredPart) {
    if (parts.some((l) => l.partId === p.id)) return
    addPart({ partId: p.id, name: p.name, sku: p.sku ?? '', price: p.price, quantity: 1 })
    setPartQuery(''); setShowParts(false)
  }

  // Submit
  function onSubmit(data: OrderFormValues) {
    try {
      const list: Order[] = JSON.parse(localStorage.getItem('orders_list') ?? '[]')
      const now = new Date().toISOString()

      const orderServices: OrderService[] = data.services.map((s, i) => ({ id: `os-${Date.now()}-${i}`, serviceId: s.serviceId, name: s.name, price: s.price, quantity: s.quantity }))
      const orderParts:    OrderPart[]    = data.parts.map((p, i)    => ({ id: `op-${Date.now()}-${i}`, partId: p.partId, name: p.name, sku: p.sku, price: p.price, quantity: p.quantity }))

      const tLabor = orderServices.reduce((s, l) => s + l.price * l.quantity, 0)
      const tParts = orderParts.reduce((s, l)    => s + l.price * l.quantity, 0)

      if (isEdit && id) {
        const updated = list.map((o) => o.id === id ? {
          ...o, ...data,
          vehicleModel: data.vehicleLabel,
          technicianId: data.technicianId, technicianName: data.technicianName,
          services: orderServices, parts: orderParts,
          totalLabor: tLabor, totalParts: tParts, total: tLabor + tParts,
          notes: data.notes, updatedAt: now,
        } : o)
        localStorage.setItem('orders_list', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('order:updated', { detail: { id } }))
      } else {
        const entry: Order = {
          id: `ord-${Date.now()}`, number: nextOrderNumber(),
          clientId: data.clientId, clientName: data.clientName,
          vehicleId: data.vehicleId, vehiclePlate: data.vehiclePlate,
          vehicleModel: data.vehicleLabel,
          technicianId: data.technicianId, technicianName: data.technicianName,
          status: 'Pendiente',
          services: orderServices, parts: orderParts,
          totalLabor: tLabor, totalParts: tParts, total: tLabor + tParts,
          notes: data.notes, createdAt: now, updatedAt: now,
        }
        localStorage.setItem('orders_list', JSON.stringify([entry, ...list]))
        window.dispatchEvent(new CustomEvent('order:created', { detail: entry }))
      }
    } catch { /* ignore */ }
    navigate('/orders')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? 'Editar Orden' : 'Nueva Orden de Trabajo'}
        description={isEdit ? 'Modifica los datos de la orden' : 'Registra diagnóstico, servicios y refacciones'}
        actions={
          <button type="button" onClick={() => navigate('/orders')}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
            <ClipboardList size={14} /> Ver órdenes
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-3 gap-5 items-start pb-28">
        {/* ── Main col ───────────────────────────────────────────── */}
        <div className="col-span-2 space-y-5">

          {/* Cliente */}
          <FormSection icon={User} title="Cliente" subtitle="Busca por nombre o teléfono">
            <div className="mt-4 space-y-3" ref={clientRef}>
              {/* Search */}
              {!watch('clientId') ? (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    value={clientQuery} onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Nombre del cliente o teléfono…"
                    className={`${input} pl-9`} />
                  {errors.clientId && <p className="mt-1 text-xs text-status-danger">{errors.clientId.message}</p>}
                  {showClients && clientResults.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
                      {clientResults.map((c) => (
                        <button key={c.id} type="button" onClick={() => selectClient(c)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-secondary text-left border-b border-surface-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{c.name}</p>
                            <p className="text-xs text-text-muted">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                          </div>
                          <span className="text-xs text-text-muted">{c.vehicleCount ?? 0} veh.</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showClients && clientResults.length === 0 && clientQuery.length >= 2 && (
                    <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg px-4 py-3">
                      <p className="text-sm text-text-muted">Sin resultados — <button type="button" onClick={() => navigate('/clients/new')} className="text-brand underline">crear cliente</button></p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-secondary px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                      <User size={16} className="text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{watch('clientName')}</p>
                      <p className="text-xs text-text-muted">{watch('clientPhone')}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setValue('clientId', ''); setValue('clientName', ''); setValue('vehicleId', ''); setValue('vehiclePlate', ''); setValue('vehicleLabel', '') }}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-white hover:text-text-primary transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </FormSection>

          {/* Vehículo */}
          <FormSection icon={Car} title="Vehículo" subtitle="Selecciona el vehículo del cliente">
            <div className="mt-4">
              {!clientId ? (
                <p className="text-sm text-text-muted text-center py-4 border border-dashed border-surface-border rounded-xl">
                  Selecciona primero un cliente
                </p>
              ) : !watch('vehicleId') ? (
                <div className="space-y-2">
                  {clientVehicles.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-4 border border-dashed border-surface-border rounded-xl">
                      Sin vehículos — <button type="button" onClick={() => navigate(`/vehicles/new?clientId=${clientId}&clientName=${encodeURIComponent(clientName)}`)} className="text-brand underline">agregar vehículo</button>
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {clientVehicles.map((v) => (
                        <button key={v.id} type="button" onClick={() => selectVehicle(v)}
                          className="flex items-center justify-between rounded-xl border border-surface-border bg-white px-4 py-3 hover:border-brand/40 hover:bg-brand-light transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary">
                              <Car size={15} className="text-text-secondary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{v.brand} {v.model} {v.year ?? ''}</p>
                              <p className="font-mono text-xs text-text-muted">{v.plate}</p>
                            </div>
                          </div>
                          {v.mileage && <span className="text-xs text-text-muted">{v.mileage.toLocaleString()} km</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.vehicleId && <p className="mt-1 text-xs text-status-danger">{errors.vehicleId.message}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-secondary px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                        <Car size={15} className="text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{vehicleLabel}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setValue('vehicleId', ''); setValue('vehiclePlate', ''); setValue('vehicleLabel', '') }}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-white hover:text-text-primary transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Kilometraje actual</label>
                      <input {...register('vehicleKm', { valueAsNumber: true })} type="number" placeholder="Ej: 52000" className={input} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Fecha promesa</label>
                      <input {...register('promiseDate')} type="date" className={input} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* Técnico y prioridad */}
          <FormSection icon={Wrench} title="Asignación" subtitle="Técnico responsable y nivel de urgencia">
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Técnico asignado</label>
                <select {...register('technicianId')} onChange={(e) => {
                  const t = TECHNICIANS.find((t) => t.id === e.target.value)
                  setValue('technicianId', e.target.value)
                  setValue('technicianName', t?.name ?? '')
                }} className={input}>
                  <option value="">Sin asignar</option>
                  {TECHNICIANS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Prioridad</label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button key={p} type="button" onClick={() => setValue('priority', p)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${priority === p ? PRIORITY_STYLE[p].replace('bg-white', 'bg-amber-50').replace('text-text-secondary', 'text-text-primary') + ' ring-1 ring-inset ring-current' : PRIORITY_STYLE[p]}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Servicios */}
          <FormSection icon={Wrench} title="Servicios / Mano de obra" subtitle="Agrega los servicios a realizar">
            <div className="mt-4 space-y-3">
              <div ref={svcRef} className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={svcQuery} onChange={(e) => setSvcQuery(e.target.value)}
                  placeholder="Buscar servicio del catálogo…"
                  className={`${input} pl-9 pr-9`} />
                {svcQuery && <button type="button" onClick={() => { setSvcQuery(''); setShowSvc(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X size={13} /></button>}
                {showSvc && svcResults.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
                    {svcResults.map((s) => (
                      <button key={s.id} type="button" onClick={() => pickService(s)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-secondary text-left border-b border-surface-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{s.name}</p>
                          <p className="text-xs text-text-muted">{s.category}</p>
                        </div>
                        <span className="text-sm font-medium text-text-primary shrink-0">{formatCurrency(s.basePrice)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showSvc && svcResults.length === 0 && svcQuery.length >= 2 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg px-4 py-3">
                    <p className="text-sm text-text-muted">Sin resultados — <button type="button" onClick={() => navigate('/services/new')} className="text-brand underline">agregar al catálogo</button></p>
                  </div>
                )}
              </div>

              {serviceFields.length > 0 && (
                <div className="rounded-xl border border-surface-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-secondary text-xs text-text-muted uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Servicio</th>
                        <th className="px-4 py-2 text-center font-medium w-24">Cant.</th>
                        <th className="px-4 py-2 text-right font-medium w-28">Precio</th>
                        <th className="px-4 py-2 text-right font-medium w-28">Subtotal</th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {serviceFields.map((field, i) => {
                        const line = services[i]
                        return (
                          <tr key={field.id} className="border-t border-surface-border/60">
                            <td className="px-4 py-2.5 font-medium text-text-primary">{line?.name}</td>
                            <td className="px-4 py-2.5">
                              <input {...register(`services.${i}.quantity`, { valueAsNumber: true })}
                                type="number" min={1}
                                className="w-16 text-center rounded-lg border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand" />
                            </td>
                            <td className="px-4 py-2.5 text-right text-text-secondary">{formatCurrency(line?.price ?? 0)}</td>
                            <td className="px-4 py-2.5 text-right font-medium">{formatCurrency((line?.price ?? 0) * (line?.quantity ?? 1))}</td>
                            <td className="px-3 py-2.5">
                              <button type="button" onClick={() => removeService(i)}
                                className="rounded-lg p-1 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {serviceFields.length === 0 && (
                <p className="text-xs text-text-muted text-center py-4 border border-dashed border-surface-border rounded-xl">
                  Agrega servicios buscando en el catálogo
                </p>
              )}
            </div>
          </FormSection>

          {/* Refacciones */}
          <FormSection icon={Package} title="Refacciones" subtitle="Partes necesarias para la reparación">
            <div className="mt-4 space-y-3">
              <div ref={partRef} className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={partQuery} onChange={(e) => setPartQuery(e.target.value)}
                  placeholder="Buscar refacción por nombre o SKU…"
                  className={`${input} pl-9 pr-9`} />
                {partQuery && <button type="button" onClick={() => { setPartQuery(''); setShowParts(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X size={13} /></button>}
                {showParts && partResults.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
                    {partResults.map((p) => (
                      <button key={p.id} type="button" onClick={() => pickPart(p)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-secondary text-left border-b border-surface-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{p.name}</p>
                          <p className="text-xs text-text-muted font-mono">{p.sku} · {p.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">{formatCurrency(p.price)}</p>
                          <p className={`text-xs ${p.stock > 0 ? 'text-status-completed' : 'text-status-danger'}`}>{p.stock} en stock</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showParts && partResults.length === 0 && partQuery.length >= 2 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg px-4 py-3">
                    <p className="text-sm text-text-muted">Sin resultados — <button type="button" onClick={() => navigate('/inventory/parts/new')} className="text-brand underline">agregar al inventario</button></p>
                  </div>
                )}
              </div>

              {partFields.length > 0 && (
                <div className="rounded-xl border border-surface-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-secondary text-xs text-text-muted uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Refacción</th>
                        <th className="px-4 py-2 text-left font-medium w-28">SKU</th>
                        <th className="px-4 py-2 text-center font-medium w-24">Cant.</th>
                        <th className="px-4 py-2 text-right font-medium w-28">Precio</th>
                        <th className="px-4 py-2 text-right font-medium w-28">Subtotal</th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {partFields.map((field, i) => {
                        const line = parts[i]
                        return (
                          <tr key={field.id} className="border-t border-surface-border/60">
                            <td className="px-4 py-2.5 font-medium text-text-primary">{line?.name}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-text-muted">{line?.sku}</td>
                            <td className="px-4 py-2.5">
                              <input {...register(`parts.${i}.quantity`, { valueAsNumber: true })}
                                type="number" min={1}
                                className="w-16 text-center rounded-lg border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand" />
                            </td>
                            <td className="px-4 py-2.5 text-right text-text-secondary">{formatCurrency(line?.price ?? 0)}</td>
                            <td className="px-4 py-2.5 text-right font-medium">{formatCurrency((line?.price ?? 0) * (line?.quantity ?? 1))}</td>
                            <td className="px-3 py-2.5">
                              <button type="button" onClick={() => removePart(i)}
                                className="rounded-lg p-1 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {partFields.length === 0 && (
                <p className="text-xs text-text-muted text-center py-4 border border-dashed border-surface-border rounded-xl">
                  Agrega refacciones buscando en el inventario
                </p>
              )}
            </div>
          </FormSection>

          {/* Notas */}
          <FormSection icon={StickyNote} title="Notas internas" subtitle="Observaciones del diagnóstico o instrucciones" collapsible defaultOpen={false}>
            <div className="mt-4">
              <textarea {...register('notes')} rows={4}
                placeholder="Descripción del problema reportado por el cliente, diagnóstico preliminar, instrucciones especiales…"
                className={`${input} resize-none`} />
            </div>
          </FormSection>

        </div>

        {/* ── Sidebar ────────────────────────────────────────────── */}
        <div className="sticky top-5 space-y-4">

          {/* Resumen */}
          <div className="rounded-2xl border border-surface-border bg-white shadow-sm p-5 space-y-4">
            <p className="text-sm font-semibold text-text-primary">Resumen de la orden</p>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/8">
              <ClipboardList size={20} className="text-brand" />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-text-muted">Cliente</p>
              <p className="text-sm font-medium text-text-primary">{clientName || '—'}</p>
            </div>

            {vehicleLabel && (
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Vehículo</p>
                <p className="text-sm font-medium text-text-primary">{vehicleLabel}</p>
              </div>
            )}

            {/* Priority badge */}
            {priority !== 'Normal' && (
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${priority === 'Urgente' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                <AlertCircle size={11} /> {priority}
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-surface-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span className="flex items-center gap-1.5"><Wrench size={11} /> Mano de obra ({serviceFields.length})</span>
                <span className="font-medium">{formatCurrency(totalLabor)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="flex items-center gap-1.5"><Package size={11} /> Refacciones ({partFields.length})</span>
                <span className="font-medium">{formatCurrency(totalParts)}</span>
              </div>
              <div className="flex justify-between text-text-primary font-semibold text-sm pt-2 border-t border-surface-border">
                <span>Total estimado</span>
                <span className="text-brand">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Dates */}
            {watch('promiseDate') && (
              <div className="flex items-center gap-2 text-xs text-text-muted border-t border-surface-border pt-3">
                <Clock size={11} />
                Entrega prometida: <span className="font-medium text-text-secondary">{watch('promiseDate')}</span>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-surface-border bg-white shadow-sm p-4 space-y-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Accesos rápidos</p>
            <button type="button" onClick={() => navigate('/clients/new')}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-surface-secondary transition-colors">
              <Plus size={12} className="text-brand" /> Nuevo cliente
            </button>
            <button type="button" onClick={() => navigate('/inventory/parts/new')}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-surface-secondary transition-colors">
              <Plus size={12} className="text-brand" /> Nueva refacción
            </button>
            <button type="button" onClick={() => navigate('/services/new')}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-surface-secondary transition-colors">
              <Plus size={12} className="text-brand" /> Nuevo servicio
            </button>
          </div>

        </div>
      </div>

      {/* ── Sticky footer ─────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-30 -mx-6 border-t border-surface-border bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {hasErrors
              ? <span className="text-status-danger font-medium">Revisa los campos con errores</span>
              : total > 0
                ? <span>Total estimado: <strong className="text-text-primary">{formatCurrency(total)}</strong></span>
                : 'Agrega al menos un servicio o refacción'}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/orders')}
              className="rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shadow-sm">
              {isEdit ? <Pencil size={15} /> : <Plus size={15} />}
              {isEdit ? 'Guardar cambios' : 'Crear orden'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
