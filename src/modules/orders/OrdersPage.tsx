import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/order.types'
import { ORDER_STATUSES } from '@/lib/constants'

const MOCK_ORDERS: Order[] = [
  { id: '1',  number: 'OT-0041', clientId: 'c1',  clientName: 'Carlos Mendoza',   vehicleId: 'v1',  vehiclePlate: 'ABC-123', vehicleModel: 'Nissan Sentra 2020',    status: 'En progreso', services: [], parts: [], totalLabor: 1200, totalParts: 850,  total: 2050, createdAt: '2026-05-10T09:00:00Z', updatedAt: '2026-05-10T09:00:00Z' },
  { id: '2',  number: 'OT-0040', clientId: 'c2',  clientName: 'Sofía Ramírez',    vehicleId: 'v2',  vehiclePlate: 'XYZ-789', vehicleModel: 'Toyota Corolla 2019',   status: 'Pendiente',   services: [], parts: [], totalLabor: 600,  totalParts: 320,  total: 920,  createdAt: '2026-05-09T14:00:00Z', updatedAt: '2026-05-09T14:00:00Z' },
  { id: '3',  number: 'OT-0039', clientId: 'c3',  clientName: 'Luis Torres',      vehicleId: 'v3',  vehiclePlate: 'LMN-456', vehicleModel: 'Honda Civic 2021',      status: 'Completada',  services: [], parts: [], totalLabor: 900,  totalParts: 1100, total: 2000, createdAt: '2026-05-08T11:00:00Z', updatedAt: '2026-05-08T17:00:00Z' },
  { id: '4',  number: 'OT-0038', clientId: 'c4',  clientName: 'María González',   vehicleId: 'v4',  vehiclePlate: 'DEF-321', vehicleModel: 'Volkswagen Jetta 2022', status: 'Completada',  services: [], parts: [], totalLabor: 1500, totalParts: 2300, total: 3800, createdAt: '2026-05-07T10:00:00Z', updatedAt: '2026-05-07T16:00:00Z' },
  { id: '5',  number: 'OT-0037', clientId: 'c5',  clientName: 'Roberto Pérez',    vehicleId: 'v5',  vehiclePlate: 'GHI-654', vehicleModel: 'Chevrolet Aveo 2018',   status: 'Cancelada',   services: [], parts: [], totalLabor: 0,    totalParts: 0,    total: 0,    createdAt: '2026-05-06T09:00:00Z', updatedAt: '2026-05-06T09:00:00Z' },
  { id: '6',  number: 'OT-0036', clientId: 'c6',  clientName: 'Ana Martínez',     vehicleId: 'v6',  vehiclePlate: 'JKL-987', vehicleModel: 'Ford Focus 2020',        status: 'En progreso', services: [], parts: [], totalLabor: 800,  totalParts: 450,  total: 1250, createdAt: '2026-05-05T13:00:00Z', updatedAt: '2026-05-05T13:00:00Z' },
  { id: '7',  number: 'OT-0035', clientId: 'c7',  clientName: 'Eduardo Vega',     vehicleId: 'v7',  vehiclePlate: 'MNO-147', vehicleModel: 'Hyundai Accent 2021',    status: 'Pendiente',   services: [], parts: [], totalLabor: 350,  totalParts: 180,  total: 530,  createdAt: '2026-05-04T10:00:00Z', updatedAt: '2026-05-04T10:00:00Z' },
  { id: '8',  number: 'OT-0034', clientId: 'c8',  clientName: 'Patricia López',   vehicleId: 'v8',  vehiclePlate: 'PQR-258', vehicleModel: 'Kia Rio 2019',           status: 'Completada',  services: [], parts: [], totalLabor: 700,  totalParts: 900,  total: 1600, createdAt: '2026-05-03T09:00:00Z', updatedAt: '2026-05-03T15:00:00Z' },
  { id: '9',  number: 'OT-0033', clientId: 'c9',  clientName: 'Fernando Castro',  vehicleId: 'v9',  vehiclePlate: 'STU-369', vehicleModel: 'Mazda 3 2022',           status: 'En progreso', services: [], parts: [], totalLabor: 1100, totalParts: 750,  total: 1850, createdAt: '2026-05-02T08:00:00Z', updatedAt: '2026-05-02T08:00:00Z' },
  { id: '10', number: 'OT-0032', clientId: 'c10', clientName: 'Gabriela Ruiz',    vehicleId: 'v10', vehiclePlate: 'VWX-741', vehicleModel: 'Seat Ibiza 2020',         status: 'Pendiente',   services: [], parts: [], totalLabor: 450,  totalParts: 280,  total: 730,  createdAt: '2026-05-01T11:00:00Z', updatedAt: '2026-05-01T11:00:00Z' },
]

const COLUMNS: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'number',      header: 'No. Orden',  cell: ({ row }) => <span className="font-medium text-brand">{row.original.number}</span> },
  { accessorKey: 'clientName',  header: 'Cliente' },
  { accessorKey: 'vehiclePlate',header: 'Placa',      cell: ({ row }) => <span className="font-mono text-sm">{row.original.vehiclePlate}</span> },
  { accessorKey: 'vehicleModel',header: 'Vehículo',   cell: ({ row }) => <span className="text-text-secondary">{row.original.vehicleModel}</span> },
  { accessorKey: 'status',      header: 'Estatus',    cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: 'total',       header: 'Total',      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.total)}</span> },
  { accessorKey: 'createdAt',   header: 'Fecha',      cell: ({ row }) => formatDate(row.original.createdAt) },
]

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  const filtered = MOCK_ORDERS.filter((o) =>
    statusFilter ? o.status === statusFilter : true
  )

  return (
    <div>
      <PageHeader
        title="Órdenes De Trabajo"
        description="Gestión de órdenes activas y completadas"
        actions={
          <button className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} />
            Nueva Orden
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <SearchInput placeholder="Buscar por cliente, placa..." onChange={setSearch} />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="border border-surface-border rounded-lg px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Todos los estatus</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {statusFilter && (
            <span className="flex items-center gap-1.5 bg-brand-light text-brand text-xs font-medium px-2.5 py-1 rounded-full">
              Estatus: {statusFilter}
              <button onClick={() => setStatusFilter('')}><X size={12} /></button>
            </span>
          )}
        </div>

        <DataTable data={filtered} columns={COLUMNS} globalFilter={search} />
      </div>
    </div>
  )
}
