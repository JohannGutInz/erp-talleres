import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, AlertTriangle, Package, Pencil, Trash2, TrendingDown } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency, cn } from '@/lib/utils'
import type { Part } from '@/types/inventory.types'
import { MOCK_PARTS } from '@/lib/mock-data'

// Seed from MOCK_PARTS enriched with supplierId
const SEED: Part[] = MOCK_PARTS.map((p) => ({
  ...p,
  description: '',
  supplierId:  p.id === 'p1' || p.id === 'p2' ? 's1' : p.id === 'p5' ? 's2' : p.id === 'p7' ? 's1' : undefined,
  supplierName: p.id === 'p1' || p.id === 'p2' ? 'Autopartes Bosch Mexico' : p.id === 'p5' ? 'Distribuidora NGK' : p.id === 'p7' ? 'Autopartes Bosch Mexico' : undefined,
  unit:        p.category === 'Lubricantes' ? 'litro' : 'pieza',
  location:    '',
}))

function loadParts(): Part[] {
  try {
    const list = JSON.parse(localStorage.getItem('parts_list') ?? 'null')
    if (list) return list
    localStorage.setItem('parts_list', JSON.stringify(SEED))
    return SEED
  } catch { return SEED }
}

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  const isOut = stock === 0
  const isLow = stock > 0 && stock <= minStock
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full w-fit',
      isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
    )}>
      {(isOut || isLow) && <AlertTriangle size={11} />}
      {isOut ? 'Sin stock' : `${stock} uds`}
    </span>
  )
}

type Tab = 'todos' | 'bajo' | 'sin'

export default function PartsPage() {
  const navigate = useNavigate()
  const [parts, setParts]   = useState<Part[]>(loadParts)
  const [search, setSearch] = useState('')
  const [tab, setTab]       = useState<Tab>('todos')
  const [catFilter, setCatFilter] = useState('')

  useEffect(() => {
    const refresh = () => setParts(loadParts())
    window.addEventListener('part:created', refresh)
    window.addEventListener('part:updated', refresh)
    return () => {
      window.removeEventListener('part:created', refresh)
      window.removeEventListener('part:updated', refresh)
    }
  }, [])

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const updated = parts.filter((p) => p.id !== id)
    localStorage.setItem('parts_list', JSON.stringify(updated))
    setParts(updated)
  }

  // KPIs
  const lowStock  = parts.filter((p) => p.stock > 0 && p.stock <= p.minStock)
  const outStock  = parts.filter((p) => p.stock === 0)
  const totalValue = parts.reduce((a, p) => a + p.stock * p.cost, 0)
  const categories = Array.from(new Set(parts.map((p) => p.category)))

  const filtered = parts.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q)
    const matchCat    = !catFilter || p.category === catFilter
    const matchTab    = tab === 'todos' ? true : tab === 'bajo' ? p.stock > 0 && p.stock <= p.minStock : p.stock === 0
    return matchSearch && matchCat && matchTab
  })

  const columns: ColumnDef<Part, unknown>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <span className="font-mono text-xs text-text-muted">{row.original.sku}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Refacción',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div>
            <p className="font-medium text-text-primary">{p.name}</p>
            <p className="text-xs text-text-muted">{p.brand ? `${p.brand} · ` : ''}{p.category}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'supplierName',
      header: 'Proveedor',
      cell: ({ row }) => <span className="text-sm text-text-secondary">{row.original.supplierName || '—'}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => <StockBadge stock={row.original.stock} minStock={row.original.minStock} />,
    },
    {
      accessorKey: 'cost',
      header: 'Costo',
      cell: ({ row }) => <span className="text-sm text-text-secondary">{formatCurrency(row.original.cost)}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Precio venta',
      cell: ({ row }) => <span className="font-medium text-text-primary">{formatCurrency(row.original.price)}</span>,
    },
    {
      id: 'margin',
      header: 'Margen',
      cell: ({ row }) => {
        const m = ((row.original.price - row.original.cost) / row.original.price * 100)
        return <span className={`text-xs font-medium ${m >= 30 ? 'text-status-completed' : m >= 15 ? 'text-status-pending' : 'text-status-danger'}`}>{m.toFixed(0)}%</span>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/inventory/parts/${row.original.id}/edit`) }}
            className="rounded-lg p-1.5 text-text-muted hover:bg-brand/10 hover:text-brand transition-colors" title="Editar">
            <Pencil size={14} />
          </button>
          <button type="button" onClick={(e) => handleDelete(e, row.original.id)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: parts.length },
    { key: 'bajo',  label: 'Stock bajo', count: lowStock.length },
    { key: 'sin',   label: 'Sin stock',  count: outStock.length },
  ]

  return (
    <div>
      <PageHeader
        title="Refacciones"
        description="Inventario de refacciones y partes"
        actions={
          <button onClick={() => navigate('/inventory/parts/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Nueva Refacción
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Total de referencias" value={parts.length} sub="SKUs en catálogo" icon={Package} />
        <KpiCard label="Stock bajo" value={lowStock.length} sub="Por debajo del mínimo" icon={AlertTriangle} iconColor="text-status-pending" />
        <KpiCard label="Sin stock" value={outStock.length} sub="Requieren pedido urgente" icon={TrendingDown} iconColor="text-status-danger" />
        <KpiCard label="Valor en almacén" value={formatCurrency(totalValue)} sub="Al costo de compra" icon={Package} iconColor="text-status-completed" />
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-surface-border pb-3">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-brand text-white' : 'text-text-secondary hover:bg-surface-secondary'}`}>
              {t.label}
              {t.count > 0 && <span className={`text-xs rounded-full px-1.5 ${tab === t.key ? 'bg-white/20 text-white' : 'bg-surface-secondary text-text-muted'}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <SearchInput placeholder="Buscar por nombre, SKU, marca…" onChange={setSearch} />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!catFilter ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary hover:bg-slate-200'}`}>
              Todas
            </button>
            {categories.map((c) => (
              <button key={c} onClick={() => setCatFilter(c === catFilter ? '' : c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${catFilter === c ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary hover:bg-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Package} message="Sin resultados" description="Intenta con otros filtros o agrega una nueva refacción" />
        ) : (
          <DataTable data={filtered} columns={columns} globalFilter={search} onRowClick={(p) => navigate(`/inventory/parts/${p.id}/edit`)} />
        )}
      </div>
    </div>
  )
}
