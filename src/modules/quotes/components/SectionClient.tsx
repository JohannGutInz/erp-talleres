import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Search, X, UserCheck, UserPlus, AlertTriangle } from 'lucide-react'
import type { Client } from '@/types/client.types'
import type { QuoteFormValues } from '@/types/quote.types'
import { MOCK_CLIENTS } from '@/lib/mock-data'
import { SectionCard } from './SectionCard'

function getAllClients(): Client[] {
  try {
    const stored = JSON.parse(localStorage.getItem('clients_list') ?? '[]') as Array<{
      id: string; name: string; phone: string; email?: string; rfc?: string
      company?: string; address?: string; vehicleCount?: number; createdAt: string
    }>
    const mapped: Client[] = stored.map((c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email,
      rfc: c.rfc, company: c.company, address: c.address,
      vehicleCount: c.vehicleCount, createdAt: c.createdAt,
    }))
    return [...MOCK_CLIENTS, ...mapped]
  } catch { return MOCK_CLIENTS }
}

interface Props {
  foundClient: Client | null
  clientMode: 'searching' | 'found' | 'new'
  onClientSelect: (client: Client) => void
  onClientClear: () => void
  onCreateNew: () => void
}

const inputCls =
  'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:bg-surface-secondary disabled:cursor-not-allowed'

export function SectionClient({ foundClient, clientMode, onClientSelect, onClientClear, onCreateNew }: Props) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<QuoteFormValues>()
  const [results, setResults] = useState<Client[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const phoneValue = watch('clientPhone')
  const needsInvoice = watch('needsInvoice')

  useEffect(() => {
    if (clientMode !== 'searching') return
    const t = setTimeout(() => {
      if (phoneValue && phoneValue.length >= 3) {
        const all = getAllClients()
        const found = all.filter((c) => c.phone.startsWith(phoneValue))
        setResults(found)
        setShowDropdown(found.length > 0)
      } else {
        setResults([])
        setShowDropdown(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [phoneValue, clientMode])

  function handleSelect(client: Client) {
    setShowDropdown(false)
    setValue('clientId', client.id)
    setValue('clientPhone', client.phone)
    setValue('clientName', client.name)
    setValue('clientEmail', client.email ?? '')
    setValue('clientRfc', client.rfc ?? '')
    setValue('clientCompany', client.company ?? '')
    setValue('clientAddress', client.address ?? '')
    onClientSelect(client)
  }

  function handleClear() {
    setValue('clientId', '')
    setValue('clientPhone', '')
    setValue('clientName', '')
    setValue('clientEmail', '')
    setValue('clientRfc', '')
    setValue('clientCompany', '')
    setValue('clientAddress', '')
    setResults([])
    setShowDropdown(false)
    onClientClear()
  }

  const isDuplicatePhone =
    clientMode === 'new' &&
    phoneValue?.length >= 10 &&
    getAllClients().some((c) => c.phone === phoneValue)

  return (
    <SectionCard number={2} title="Cliente" subtitle="Busca o registra al cliente">
      <div className="space-y-4">
        {/* Phone search */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Teléfono <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              {...register('clientPhone')}
              type="tel"
              placeholder="Escribe el teléfono para buscar…"
              disabled={clientMode === 'found'}
              className={`${inputCls} pl-9 pr-9`}
            />
            {(clientMode === 'found' || clientMode === 'new') && (
              <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                <X size={15} />
              </button>
            )}
            {showDropdown && (
              <div className="absolute z-20 top-full mt-1 w-full rounded-lg border border-surface-border bg-white shadow-lg overflow-hidden">
                {results.map((c) => (
                  <button key={c.id} type="button" onClick={() => handleSelect(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary text-left">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                      {c.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-muted">{c.phone}{c.vehicleCount ? ` · ${c.vehicleCount} vehículo(s)` : ''}</p>
                    </div>
                  </button>
                ))}
                <button type="button" onClick={() => { setShowDropdown(false); onCreateNew() }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-brand font-medium border-t border-surface-border hover:bg-brand/5">
                  <UserPlus size={13} /> Crear nuevo cliente con este número
                </button>
              </div>
            )}
          </div>
          {errors.clientPhone && <p className="mt-1 text-xs text-status-danger">{errors.clientPhone.message}</p>}
          {isDuplicatePhone && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle size={12} /> Ya existe un cliente con este teléfono
            </p>
          )}
          {clientMode === 'searching' && phoneValue?.length >= 10 && results.length === 0 && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-surface-border bg-surface-secondary px-4 py-3">
              <p className="text-sm text-text-secondary">No se encontró cliente con este teléfono</p>
              <button type="button" onClick={onCreateNew}
                className="flex items-center gap-1.5 text-sm text-brand font-medium hover:underline">
                <UserPlus size={13} /> Crear nuevo
              </button>
            </div>
          )}
        </div>

        {/* Found client banner */}
        {clientMode === 'found' && foundClient && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <UserCheck size={16} className="text-status-completed shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{foundClient.name}</p>
              <p className="text-xs text-text-muted truncate">{foundClient.phone}{foundClient.lastVisit ? ` · Últ. visita ${foundClient.lastVisit}` : ''}</p>
            </div>
          </div>
        )}

        {/* Client fields */}
        {(clientMode === 'found' || clientMode === 'new') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Nombre completo <span className="text-status-danger">*</span>
              </label>
              <input {...register('clientName')} disabled={clientMode === 'found'}
                placeholder="Nombre del cliente" className={inputCls} />
              {errors.clientName && <p className="mt-1 text-xs text-status-danger">{errors.clientName.message}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-surface-border px-4 py-3 hover:bg-surface-secondary transition-colors">
              <input type="checkbox" {...register('needsInvoice')}
                className="h-4 w-4 rounded border-surface-border text-brand focus:ring-brand" />
              <div>
                <p className="text-sm font-medium text-text-primary">Requiere factura (CFDI)</p>
                <p className="text-xs text-text-muted">Activa para capturar datos fiscales del cliente</p>
              </div>
            </label>

            {needsInvoice && (
              <div className="rounded-lg border border-surface-border bg-surface-secondary/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Datos fiscales</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: 'clientEmail' as const, label: 'Correo electrónico', placeholder: 'correo@empresa.com', required: true },
                    { field: 'clientRfc' as const, label: 'RFC', placeholder: 'XXXX000000XXX', required: true },
                    { field: 'clientCompany' as const, label: 'Empresa / Razón social', placeholder: 'Nombre de la empresa' },
                    { field: 'clientAddress' as const, label: 'Dirección fiscal', placeholder: 'Calle, núm., colonia…' },
                  ].map(({ field, label, placeholder, required }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        {label} {required && <span className="text-status-danger">*</span>}
                      </label>
                      <input {...register(field)} placeholder={placeholder} className={inputCls} />
                      {errors[field] && <p className="mt-1 text-xs text-status-danger">{(errors[field] as { message?: string })?.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  )
}
