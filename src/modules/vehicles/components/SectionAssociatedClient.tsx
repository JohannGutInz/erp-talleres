import { useState, useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Search, X, UserCheck, Star, Receipt, AlertTriangle } from 'lucide-react'
import type { VehicleFormValues, SearchableClient } from '@/types/vehicle-form.types'
import { MOCK_CLIENTS } from '@/lib/mock-data'
import { VehicleSectionCard } from './VehicleSectionCard'

function getAllClients(): SearchableClient[] {
  const base: SearchableClient[] = MOCK_CLIENTS.map((c) => ({
    id: c.id, name: c.name, phone: c.phone, rfc: c.rfc,
    vehicleCount: c.vehicleCount ?? 0, isFrequent: false, requiresBilling: !!c.rfc,
  }))
  try {
    const stored = JSON.parse(localStorage.getItem('clients_list') ?? '[]')
    const mapped: SearchableClient[] = stored.map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: c.name as string,
      phone: c.phone as string,
      rfc: c.requiresBilling ? (c.rfc as string | undefined) : undefined,
      vehicleCount: (c.vehicleCount as number) ?? 0,
      isFrequent: (c.isFrequent as boolean) ?? false,
      requiresBilling: (c.requiresBilling as boolean) ?? false,
    }))
    return [...mapped, ...base]
  } catch { return base }
}

function search(q: string): SearchableClient[] {
  const t = q.toLowerCase()
  return getAllClients().filter((c) =>
    c.name.toLowerCase().includes(t) ||
    c.phone.includes(t) ||
    (c.rfc?.toLowerCase().includes(t))
  ).slice(0, 6)
}

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors'

export function SectionAssociatedClient() {
  const { setValue, watch, formState: { errors } } = useFormContext<VehicleFormValues>()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchableClient[]>([])
  const [showDrop, setShowDrop] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const clientId = watch('clientId')
  const clientName = watch('clientName')

  const selected = clientId
    ? getAllClients().find((c) => c.id === clientId) ?? null
    : null

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); setShowDrop(false); return }
    const t = setTimeout(() => {
      const r = search(query)
      setResults(r)
      setShowDrop(r.length > 0)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(c: SearchableClient) {
    setValue('clientId', c.id)
    setValue('clientName', c.name)
    setQuery('')
    setShowDrop(false)
  }

  function handleClear() {
    setValue('clientId', '')
    setValue('clientName', '')
    setQuery('')
  }

  return (
    <VehicleSectionCard icon={UserCheck} title="Cliente asociado" subtitle="El vehículo siempre pertenece a un cliente">
      <div className="mt-5 space-y-4">
        {!clientId ? (
          <div ref={wrapRef} className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, teléfono o RFC…"
              className={`${input} pl-10`}
              autoComplete="off"
            />
            {showDrop && (
              <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-surface-border bg-white shadow-lg overflow-hidden">
                {results.map((c) => (
                  <button key={c.id} type="button" onClick={() => handleSelect(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary text-left border-b border-surface-border/50 last:border-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                      {c.name.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                        {c.isFrequent && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-text-muted">{c.phone} · {c.vehicleCount} vehículo{c.vehicleCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-1">
                      {c.requiresBilling && <span className="text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">CFDI</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
              {clientName?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-text-primary">{clientName}</p>
                {selected?.isFrequent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <Star size={10} className="fill-amber-500" /> Frecuente
                  </span>
                )}
                {selected?.requiresBilling && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <Receipt size={10} /> Facturación activa
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {selected?.phone} · {selected?.vehicleCount ?? 0} vehículo{(selected?.vehicleCount ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <button type="button" onClick={handleClear} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-white/70 transition-colors">
              <X size={15} />
            </button>
          </div>
        )}
        {errors.clientId && (
          <p className="text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.clientId.message}</p>
        )}
      </div>
    </VehicleSectionCard>
  )
}
