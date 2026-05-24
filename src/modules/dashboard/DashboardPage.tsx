import { useState } from 'react'
import { Wrench, DollarSign, AlertCircle, Calendar } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { KpiCard } from '@/components/ui/KpiCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { PageHeader } from '@/components/ui/PageHeader'
import { OrdersByStatusPie } from '@/components/charts/OrdersByStatusPie'
import { RevenueBarChart } from '@/components/charts/RevenueBarChart'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order } from '@/types/order.types'


// pantalla inicial con resumen de KPIs, gráficos y últimas órdenes de trabajo 


const MOCK_ORDERS: Order[] = [
  { id: '1', number: 'OT-0041', clientId: 'c1', clientName: 'Carlos Mendoza',   vehicleId: 'v1', vehiclePlate: 'ABC-123', vehicleModel: 'Nissan Sentra 2020',   status: 'En progreso', services: [], parts: [], totalLabor: 1200, totalParts: 850,  total: 2050, createdAt: '2026-05-10T09:00:00Z', updatedAt: '2026-05-10T09:00:00Z' },
  { id: '2', number: 'OT-0040', clientId: 'c2', clientName: 'Sofía Ramírez',    vehicleId: 'v2', vehiclePlate: 'XYZ-789', vehicleModel: 'Toyota Corolla 2019',   status: 'Pendiente',   services: [], parts: [], totalLabor: 600,  totalParts: 320,  total: 920,  createdAt: '2026-05-09T14:00:00Z', updatedAt: '2026-05-09T14:00:00Z' },
  { id: '3', number: 'OT-0039', clientId: 'c3', clientName: 'Luis Torres',      vehicleId: 'v3', vehiclePlate: 'LMN-456', vehicleModel: 'Honda Civic 2021',      status: 'Completada',  services: [], parts: [], totalLabor: 900,  totalParts: 1100, total: 2000, createdAt: '2026-05-08T11:00:00Z', updatedAt: '2026-05-08T17:00:00Z' },
  { id: '4', number: 'OT-0038', clientId: 'c4', clientName: 'María González',   vehicleId: 'v4', vehiclePlate: 'DEF-321', vehicleModel: 'Volkswagen Jetta 2022',  status: 'Completada',  services: [], parts: [], totalLabor: 1500, totalParts: 2300, total: 3800, createdAt: '2026-05-07T10:00:00Z', updatedAt: '2026-05-07T16:00:00Z' },
  { id: '5', number: 'OT-0037', clientId: 'c5', clientName: 'Roberto Pérez',    vehicleId: 'v5', vehiclePlate: 'GHI-654', vehicleModel: 'Chevrolet Aveo 2018',    status: 'Cancelada',   services: [], parts: [], totalLabor: 0,    totalParts: 0,    total: 0,    createdAt: '2026-05-06T09:00:00Z', updatedAt: '2026-05-06T09:00:00Z' },
  { id: '6', number: 'OT-0036', clientId: 'c6', clientName: 'Ana Martínez',     vehicleId: 'v6', vehiclePlate: 'JKL-987', vehicleModel: 'Ford Focus 2020',        status: 'En progreso', services: [], parts: [], totalLabor: 800,  totalParts: 450,  total: 1250, createdAt: '2026-05-05T13:00:00Z', updatedAt: '2026-05-05T13:00:00Z' },
  { id: '7', number: 'OT-0035', clientId: 'c7', clientName: 'Eduardo Vega',     vehicleId: 'v7', vehiclePlate: 'MNO-147', vehicleModel: 'Hyundai Accent 2021',    status: 'Pendiente',   services: [], parts: [], totalLabor: 350,  totalParts: 180,  total: 530,  createdAt: '2026-05-04T10:00:00Z', updatedAt: '2026-05-04T10:00:00Z' },
  { id: '8', number: 'OT-0034', clientId: 'c8', clientName: 'Patricia López',   vehicleId: 'v8', vehiclePlate: 'PQR-258', vehicleModel: 'Kia Rio 2019',           status: 'Completada',  services: [], parts: [], totalLabor: 700,  totalParts: 900,  total: 1600, createdAt: '2026-05-03T09:00:00Z', updatedAt: '2026-05-03T15:00:00Z' },
]

const COLUMNS: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'number',      header: 'Número de orden', cell: ({ row }) => <span className="font-medium text-brand">{row.original.number}</span> },
  { accessorKey: 'clientName',  header: 'Cliente' },
  { accessorKey: 'vehicleModel',header: 'Vehículo', cell: ({ row }) => <span className="text-text-secondary">{row.original.vehicleModel}</span> },
  { accessorKey: 'status',      header: 'Estatus',  cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: 'total',       header: 'Total',    cell: ({ row }) => formatCurrency(row.original.total) },
  { accessorKey: 'createdAt',   header: 'Fecha',    cell: ({ row }) => formatDate(row.original.createdAt) },
]

const CALENDAR_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function MiniCalendar() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay + 6) % 7

  const monthName = today.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-primary capitalize">{monthName}</span>
        <div className="flex gap-1">
          <button className="p-1 rounded hover:bg-surface-secondary text-text-muted"><span className="text-xs">‹</span></button>
          <button className="px-2 py-0.5 text-xs rounded border border-surface-border text-text-secondary hover:bg-surface-secondary">Hoy</button>
          <button className="p-1 rounded hover:bg-surface-secondary text-text-muted"><span className="text-xs">›</span></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {CALENDAR_DAYS.map((d) => (
          <div key={d} className="text-xs text-text-muted font-medium py-1">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`text-xs py-1.5 rounded-md ${
              day === today.getDate() ? 'bg-brand text-white font-semibold' : day ? 'hover:bg-surface-secondary text-text-primary cursor-pointer' : ''
            }`}
          >
            {day ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [search, setSearch] = useState('')

  return (
    <div>
      <PageHeader title="Inicio" description="Resumen general del taller" />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="Órdenes de trabajo" value={41}         sub="Activas ✓"                    icon={Wrench}       trend={{ value: 12, direction: 'up' }}   />
        <KpiCard label="Ingresos"           value="$63,100"    sub="Órdenes Completadas"           icon={DollarSign}   trend={{ value: 8,  direction: 'up' }}   />
        <KpiCard label="Cuentas por pagar"  value="$14,200"    sub="Deuda a proveedores"           icon={AlertCircle}  trend={{ value: 3,  direction: 'down' }}  />
        <KpiCard label="Citas"              value={12}         sub="Citas de la semana"            icon={Calendar}     />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Órdenes por Estatus</h2>
          <p className="text-xs text-text-muted mb-4">Distribución del mes actual</p>
          <OrdersByStatusPie />
        </div>
        <div className="col-span-2 rounded-xl border border-surface-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Ingresos mensuales</h2>
          <p className="text-xs text-text-muted mb-4">Últimos 6 meses</p>
          <RevenueBarChart />
        </div>
      </div>

      {/* Table + Calendar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-xl border border-surface-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Últimas Órdenes</h2>
            <SearchInput placeholder="Buscar orden..." onChange={setSearch} />
          </div>
          <DataTable data={MOCK_ORDERS} columns={COLUMNS} globalFilter={search} />
        </div>
        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Calendario</h2>
          <MiniCalendar />
        </div>
      </div>
    </div>
  )
}
