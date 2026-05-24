import { useState, useEffect } from 'react'
import { Plus, Car, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import type { VehicleFormValues } from '@/types/vehicle-form.types'

interface StoredVehicle extends VehicleFormValues {
  id: string
  createdAt: string
}

function loadVehicles(): StoredVehicle[] {
  try { return JSON.parse(localStorage.getItem('vehicles_list') ?? '[]') } catch { return [] }
}

export default function VehiclesPage() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<StoredVehicle[]>(loadVehicles)
  const [search, setSearch] = useState('')

  useEffect(() => {
    function refresh() { setVehicles(loadVehicles()) }
    window.addEventListener('vehicle:created', refresh)
    window.addEventListener('vehicle:updated', refresh)
    return () => {
      window.removeEventListener('vehicle:created', refresh)
      window.removeEventListener('vehicle:updated', refresh)
    }
  }, [])

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const updated = vehicles.filter((v) => v.id !== id)
    localStorage.setItem('vehicles_list', JSON.stringify(updated))
    setVehicles(updated)
  }

  const columns: ColumnDef<StoredVehicle, unknown>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-sm text-text-primary tracking-wider">
          {row.original.plate}
        </span>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Vehículo',
      cell: ({ row }) => {
        const v = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Car size={14} className="text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {v.brand} {v.model} {v.submodel ? `· ${v.submodel}` : ''}
              </p>
              <p className="text-xs text-text-muted">
                {v.year ?? '—'} {v.color ? `· ${v.color}` : ''} {v.transmission ? `· ${v.transmission}` : ''}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'clientName',
      header: 'Propietario',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary">{row.original.clientName || '—'}</span>
      ),
    },
    {
      accessorKey: 'mileage',
      header: 'Kilometraje',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary">
          {row.original.mileage ? `${row.original.mileage.toLocaleString('es-MX')} km` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'fuelType',
      header: 'Combustible',
      cell: ({ row }) => row.original.fuelType
        ? <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-secondary">{row.original.fuelType}</span>
        : <span className="text-text-muted">—</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Registrado',
      cell: ({ row }) => <span className="text-sm text-text-muted">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row.original.id}/edit`) }}
            className="rounded-lg p-1.5 text-text-muted hover:bg-brand/10 hover:text-brand transition-colors"
            title="Editar">
            <Pencil size={14} />
          </button>
          <button type="button"
            onClick={(e) => handleDelete(e, row.original.id)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Vehículos"
        description="Unidades registradas en el sistema"
        actions={
          <button onClick={() => navigate('/vehicles/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Nuevo Vehículo
          </button>
        }
      />
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        {vehicles.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <SearchInput placeholder="Buscar por placa, marca, propietario…" onChange={setSearch} />
            <p className="text-xs text-text-muted whitespace-nowrap">
              {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        {vehicles.length === 0 ? (
          <EmptyState icon={Car} message="Sin vehículos registrados" description="Registra el primer vehículo y asígnalo a un cliente" />
        ) : (
          <DataTable
            data={vehicles}
            columns={columns}
            globalFilter={search}
            onRowClick={(v) => navigate(`/vehicles/${v.id}/edit`)}
          />
        )}
      </div>
    </div>
  )
}
