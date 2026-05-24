import { useState, useEffect } from 'react'
import { Plus, Phone, Mail, Star, Building2, User, Trash2, Pencil, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import type { ClientFormValues } from '@/types/client-form.types'

interface StoredClient extends ClientFormValues {
  id: string
  vehicleCount: number
  createdAt: string
}

function loadClients(): StoredClient[] {
  try {
    return JSON.parse(localStorage.getItem('clients_list') ?? '[]')
  } catch {
    return []
  }
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<StoredClient[]>(loadClients)
  const [search, setSearch] = useState('')

  useEffect(() => {
    function refresh() { setClients(loadClients()) }
    window.addEventListener('client:created', refresh)
    window.addEventListener('client:updated', refresh)
    return () => {
      window.removeEventListener('client:created', refresh)
      window.removeEventListener('client:updated', refresh)
    }
  }, [])

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const updated = clients.filter((c) => c.id !== id)
    localStorage.setItem('clients_list', JSON.stringify(updated))
    setClients(updated)
  }

  const columns: ColumnDef<StoredClient, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Cliente',
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.clientType === 'empresa' ? 'bg-blue-100 text-blue-700' : 'bg-brand/10 text-brand'}`}>
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-text-primary">{c.name}</p>
                {c.isFrequent && <Star size={11} className="text-amber-400 fill-amber-400" />}
              </div>
              {c.requiresBilling && c.rfc
                ? <p className="text-xs text-text-muted font-mono">{c.rfc}</p>
                : <p className="text-xs text-text-muted">{c.company || '—'}</p>
              }
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'phone',
      header: 'Contacto',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Phone size={12} className="text-text-muted" />{row.original.phone}
          </span>
          {row.original.email && (
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Mail size={11} />{row.original.email}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const c = row.original
        return c.clientType === 'empresa'
          ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"><Building2 size={10} />Empresa</span>
          : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"><User size={10} />Persona física</span>
      },
    },
    {
      accessorKey: 'vehicleCount',
      header: 'Vehículos',
      cell: ({ row }) => (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold text-text-secondary">
          {row.original.vehicleCount}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Registrado',
      cell: ({ row }) => (
        <span className="text-sm text-text-muted">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/clients/${row.original.id}/edit`) }}
            className="rounded-lg p-1.5 text-text-muted hover:bg-brand/10 hover:text-brand transition-colors"
            title="Editar cliente"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => handleDelete(e, row.original.id)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Eliminar cliente"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Directorio de clientes del taller"
        actions={
          <button
            onClick={() => navigate('/clients/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nuevo Cliente
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        {clients.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <SearchInput placeholder="Buscar por nombre, teléfono, RFC…" onChange={setSearch} />
            <p className="text-xs text-text-muted whitespace-nowrap">
              {clients.length} cliente{clients.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            message="Sin clientes registrados"
            description="Crea el primer cliente para empezar a gestionar tu directorio"
          />
        ) : (
          <DataTable
            data={clients}
            columns={columns}
            globalFilter={search}
            onRowClick={(c) => navigate(`/clients/${c.id}/edit`)}
          />
        )}
      </div>
    </div>
  )
}
