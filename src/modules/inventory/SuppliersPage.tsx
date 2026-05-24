import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Truck, Pencil, Trash2, DollarSign, ShoppingCart } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency } from '@/lib/utils'
import type { Supplier } from '@/types/inventory.types'

const SEED_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Autopartes Bosch Mexico',     contact: 'Miguel Soto',    phone: '800-100-2672', email: 'ventas@bosch.com.mx',       rfc: 'ABM920301XX1', address: 'Av. Insurgentes Sur 1700', city: 'Ciudad de México', creditDays: 30, balance: 8400,  notes: 'Proveedor principal de filtros y baterías', createdAt: '2023-05-01' },
  { id: 's2', name: 'Distribuidora NGK',            contact: 'Laura Fuentes',  phone: '55-1234-5678', email: 'contacto@ngk.com.mx',        rfc: 'DNG850715XX2', address: 'Blvd. Adolfo López Mateos 2321', city: 'Guadalajara', creditDays: 15, balance: 2100,  notes: 'Bujías y componentes de encendido', createdAt: '2023-07-15' },
  { id: 's3', name: 'Refacciones Monroe SA',        contact: 'Jorge Ávila',    phone: '33-9876-5432', email: 'ventas@monroe.com.mx',       rfc: 'RMO910822XX3', address: 'Calle Hidalgo 450', city: 'Monterrey',              creditDays: 30, balance: 5600,  notes: 'Suspensión y amortiguadores', createdAt: '2024-01-10' },
  { id: 's4', name: 'Lubricantes Mobil MX',         contact: 'Sandra Rojas',   phone: '81-2345-6789', email: 'distribución@mobil.mx',      rfc: 'LMM780430XX4', address: 'Av. Ruiz Cortines 890', city: 'Monterrey',            creditDays: 45, balance: 12000, notes: 'Aceites y lubricantes especializados', createdAt: '2023-03-20' },
  { id: 's5', name: 'Frenos Wagner Distribuidora',  contact: 'Ana Pacheco',    phone: '55-8765-4321', email: 'ventas@wagner.com.mx',       rfc: 'FWD900612XX5', address: 'Calzada de Tlalpan 1500', city: 'Ciudad de México', creditDays: 30, balance: 3200,  notes: 'Pastillas y discos de freno', createdAt: '2024-03-01' },
]

function loadSuppliers(): Supplier[] {
  try {
    const list = JSON.parse(localStorage.getItem('suppliers_list') ?? 'null')
    if (list) return list
    localStorage.setItem('suppliers_list', JSON.stringify(SEED_SUPPLIERS))
    return SEED_SUPPLIERS
  } catch { return SEED_SUPPLIERS }
}

function getSupplierPartsCount(supplierId: string): number {
  try {
    const parts = JSON.parse(localStorage.getItem('parts_list') ?? '[]')
    return parts.filter((p: { supplierId?: string }) => p.supplierId === supplierId).length
  } catch { return 0 }
}

function getSupplierOpenPOsCount(supplierId: string): number {
  try {
    const pos = JSON.parse(localStorage.getItem('purchase_orders_list') ?? '[]')
    return pos.filter((po: { supplierId: string; status: string }) =>
      po.supplierId === supplierId && !['Recibida', 'Cancelada'].includes(po.status)
    ).length
  } catch { return 0 }
}

export default function SuppliersPage() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    const refresh = () => setSuppliers(loadSuppliers())
    window.addEventListener('supplier:created', refresh)
    window.addEventListener('supplier:updated', refresh)
    return () => {
      window.removeEventListener('supplier:created', refresh)
      window.removeEventListener('supplier:updated', refresh)
    }
  }, [])

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const updated = suppliers.filter((s) => s.id !== id)
    localStorage.setItem('suppliers_list', JSON.stringify(updated))
    setSuppliers(updated)
  }

  const totalBalance   = suppliers.reduce((a, s) => a + s.balance, 0)
  const withBalance    = suppliers.filter((s) => s.balance > 0)
  const avgCreditDays  = suppliers.length ? Math.round(suppliers.reduce((a, s) => a + (s.creditDays ?? 0), 0) / suppliers.length) : 0

  const columns: ColumnDef<Supplier, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Proveedor',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.name}</p>
          {row.original.rfc && <p className="text-xs text-text-muted font-mono">{row.original.rfc}</p>}
        </div>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contacto',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-text-primary">{row.original.contact || '—'}</p>
          <p className="text-xs text-text-muted">{row.original.phone || ''}</p>
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Ciudad',
      cell: ({ row }) => <span className="text-sm text-text-secondary">{row.original.city || '—'}</span>,
    },
    {
      id: 'parts',
      header: 'Refacciones',
      cell: ({ row }) => {
        const count = getSupplierPartsCount(row.original.id)
        return <span className="text-sm text-text-secondary">{count} refs.</span>
      },
    },
    {
      id: 'openPOs',
      header: 'OC abiertas',
      cell: ({ row }) => {
        const count = getSupplierOpenPOsCount(row.original.id)
        return count > 0
          ? <span className="rounded-full bg-brand-light text-brand text-xs font-medium px-2.5 py-0.5">{count} pendiente{count !== 1 ? 's' : ''}</span>
          : <span className="text-xs text-text-muted">—</span>
      },
    },
    {
      accessorKey: 'creditDays',
      header: 'Plazo',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary">
          {row.original.creditDays ? `${row.original.creditDays} días` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Saldo pendiente',
      cell: ({ row }) => (
        <span className={`font-medium text-sm ${row.original.balance > 0 ? 'text-status-danger' : 'text-status-completed'}`}>
          {formatCurrency(row.original.balance)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/inventory/suppliers/${row.original.id}/edit`) }}
            className="rounded-lg p-1.5 text-text-muted hover:bg-brand/10 hover:text-brand transition-colors">
            <Pencil size={14} />
          </button>
          <button type="button" onClick={(e) => handleDelete(e, row.original.id)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || (s.contact ?? '').toLowerCase().includes(q) || (s.rfc ?? '').toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Directorio de proveedores de refacciones"
        actions={
          <button onClick={() => navigate('/inventory/suppliers/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Nuevo Proveedor
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Total proveedores"   value={suppliers.length}       sub="En el directorio"     icon={Truck} />
        <KpiCard label="Con saldo pendiente" value={withBalance.length}     sub="Requieren pago"        icon={DollarSign}  iconColor="text-status-danger" />
        <KpiCard label="Deuda total"         value={formatCurrency(totalBalance)} sub="Con todos los proveedores" icon={ShoppingCart} iconColor="text-status-pending" />
        <KpiCard label="Plazo promedio"      value={`${avgCreditDays} días`} sub="De crédito"           icon={Truck}       iconColor="text-status-progress" />
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <SearchInput placeholder="Buscar proveedor, contacto o RFC…" onChange={setSearch} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Truck} message="Sin proveedores" description="Agrega el primer proveedor de refacciones" />
        ) : (
          <DataTable data={filtered} columns={columns} globalFilter={search} onRowClick={(s) => navigate(`/inventory/suppliers/${s.id}/edit`)} />
        )}
      </div>
    </div>
  )
}
