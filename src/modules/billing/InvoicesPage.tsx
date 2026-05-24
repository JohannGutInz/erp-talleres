import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types/billing.types'

const MOCK_INVOICES: Invoice[] = [
  { id: 'i1', folio: 'F-001', orderId: '3', orderNumber: 'OT-0039', clientId: 'c3', clientName: 'Luis Torres',    clientRfc: 'TOLU780901CD3', uuid: 'a1b2c3d4-...', subtotal: 1724, iva: 276,  total: 2000, status: 'Timbrada', paymentMethod: 'PUE', paymentForm: '01', cfdiUse: 'G03', issuedAt: '2026-05-08', createdAt: '2026-05-08' },
  { id: 'i2', folio: 'F-002', orderId: '4', orderNumber: 'OT-0038', clientId: 'c4', clientName: 'María González', clientRfc: 'GOMM920415EF5', uuid: 'b2c3d4e5-...', subtotal: 3276, iva: 524,  total: 3800, status: 'Timbrada', paymentMethod: 'PUE', paymentForm: '04', cfdiUse: 'G03', issuedAt: '2026-05-07', createdAt: '2026-05-07' },
  { id: 'i3', folio: 'F-003', orderId: '8', orderNumber: 'OT-0034', clientId: 'c8', clientName: 'Patricia López', clientRfc: 'LOPPA790311IJ9', uuid: undefined,      subtotal: 1379, iva: 221,  total: 1600, status: 'Borrador',  paymentMethod: 'PPD', paymentForm: '99', cfdiUse: 'G03', issuedAt: undefined,     createdAt: '2026-05-03' },
  { id: 'i4', folio: 'F-004', orderId: '1', orderNumber: 'OT-0041', clientId: 'c1', clientName: 'Carlos Mendoza', clientRfc: 'MECC850312AB1', uuid: undefined,      subtotal: 1767, iva: 283,  total: 2050, status: 'Borrador',  paymentMethod: 'PUE', paymentForm: '01', cfdiUse: 'G03', issuedAt: undefined,     createdAt: '2026-05-10' },
]

const COLUMNS: ColumnDef<Invoice, unknown>[] = [
  { accessorKey: 'folio',       header: 'Folio',    cell: ({ row }) => <span className="font-medium text-brand">{row.original.folio}</span> },
  { accessorKey: 'orderNumber', header: 'Orden' },
  { accessorKey: 'clientName',  header: 'Cliente',  cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.clientName}</p>
      <p className="text-xs text-text-muted font-mono">{row.original.clientRfc}</p>
    </div>
  )},
  { accessorKey: 'total',       header: 'Total',    cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.total)}</span> },
  { accessorKey: 'status',      header: 'Estatus',  cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: 'createdAt',   header: 'Fecha',    cell: ({ row }) => formatDate(row.original.createdAt) },
]

export default function InvoicesPage() {
  const [search, setSearch] = useState('')

  return (
    <div>
      <PageHeader
        title="Notas Fiscales"
        description="CFDI emitidos y borradores"
        actions={
          <button className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} />
            Nueva Factura
          </button>
        }
      />
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <SearchInput placeholder="Buscar por folio, cliente..." onChange={setSearch} />
        </div>
        <DataTable data={MOCK_INVOICES} columns={COLUMNS} globalFilter={search} />
      </div>
    </div>
  )
}
