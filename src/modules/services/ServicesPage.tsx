import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Scissors, Pencil, Trash2, ToggleLeft, ToggleRight, Package } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency } from '@/lib/utils'
import type { StoredService } from '@/types/service.types'
import { SERVICE_CATEGORIES } from '@/types/service.types'

// ── Seed data ──────────────────────────────────────────────────────
const SEED_SERVICES: StoredService[] = [
  { id: 'sv-1', name: 'Cambio de aceite y filtro', category: 'Mantenimiento preventivo', description: 'Sustitución de aceite de motor y filtro de aceite', basePrice: 650, estimatedHours: 0.5, requiredParts: [{ partId: 'p1', partName: 'Aceite 5W30 1L', sku: 'ACC-0001', quantity: 4 }, { partId: 'p2', partName: 'Filtro de aceite', sku: 'FIL-0023', quantity: 1 }], active: true, notes: '', usageCount: 48, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-2', name: 'Afinación menor', category: 'Mantenimiento preventivo', description: 'Bujías, filtro de aire y revisión de fluidos', basePrice: 1200, estimatedHours: 1.5, requiredParts: [{ partId: 'p5', partName: 'Bujías (juego x4)', sku: 'BUJ-0010', quantity: 1 }, { partId: 'p6', partName: 'Filtro de aire', sku: 'FIL-0024', quantity: 1 }], active: true, notes: '', usageCount: 36, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-3', name: 'Cambio de pastillas de freno', category: 'Frenos', description: 'Sustitución de pastillas de freno delanteras y/o traseras', basePrice: 1500, estimatedHours: 2, requiredParts: [{ partId: 'p3', partName: 'Pastillas de freno delanteras', sku: 'FRE-0045', quantity: 1 }], active: true, notes: '', usageCount: 22, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-4', name: 'Diagnóstico electrónico', category: 'Diagnóstico', description: 'Escaneo OBD2 e interpretación de códigos de falla', basePrice: 450, estimatedHours: 1, requiredParts: [], active: true, notes: 'Incluye lectura y borrado de códigos', usageCount: 55, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-5', name: 'Cambio de batería', category: 'Eléctrica y electrónica', description: 'Sustitución de batería y revisión del sistema de carga', basePrice: 350, estimatedHours: 0.5, requiredParts: [{ partId: 'p7', partName: 'Batería 12V 60Ah', sku: 'BAT-0005', quantity: 1 }], active: true, notes: '', usageCount: 18, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-6', name: 'Revisión preventiva 50 puntos', category: 'Mantenimiento preventivo', description: 'Inspección completa del vehículo: motor, frenos, suspensión, llantas, fluidos y electrónica', basePrice: 350, estimatedHours: 1.5, requiredParts: [], active: true, notes: 'Genera reporte impreso para el cliente', usageCount: 30, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-7', name: 'Cambio de discos y pastillas de freno', category: 'Frenos', description: 'Sustitución de discos y pastillas de freno (eje delantero)', basePrice: 3200, estimatedHours: 3, requiredParts: [{ partId: 'p3', partName: 'Pastillas de freno delanteras', sku: 'FRE-0045', quantity: 1 }, { partId: 'p4', partName: 'Disco de freno', sku: 'FRE-0046', quantity: 2 }], active: true, notes: '', usageCount: 14, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-8', name: 'Carga y revisión de A/C', category: 'A/C y climatización', description: 'Diagnóstico, carga de gas refrigerante y revisión del compresor', basePrice: 900, estimatedHours: 1.5, requiredParts: [], active: true, notes: 'Gas refrigerante R134a o R1234yf según modelo', usageCount: 27, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-9', name: 'Alineación y balanceo', category: 'Llantas y alineación', description: 'Alineación computarizada de 4 ruedas + balanceo de los 4 neumáticos', basePrice: 600, estimatedHours: 1, requiredParts: [], active: true, notes: '', usageCount: 42, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
  { id: 'sv-10', name: 'Reparación de fugas de aceite', category: 'Motor', description: 'Localización y reparación de fugas en empaquetaduras, retenes y juntas', basePrice: 1800, estimatedHours: 3, requiredParts: [], active: false, notes: 'El costo de refacciones se cotiza por separado según el diagnóstico', usageCount: 9, createdAt: '2024-01-01', updatedAt: '2026-05-01' },
]

function loadServices(): StoredService[] {
  try {
    const list = JSON.parse(localStorage.getItem('services_list') ?? 'null')
    if (list) return list
    localStorage.setItem('services_list', JSON.stringify(SEED_SERVICES))
    return SEED_SERVICES
  } catch { return SEED_SERVICES }
}

export default function ServicesPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<StoredService[]>(loadServices)
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter] = useState('')

  useEffect(() => {
    const refresh = () => setServices(loadServices())
    window.addEventListener('service:created', refresh)
    window.addEventListener('service:updated', refresh)
    return () => {
      window.removeEventListener('service:created', refresh)
      window.removeEventListener('service:updated', refresh)
    }
  }, [])

  function handleToggleActive(id: string) {
    const updated = services.map((s) => s.id === id ? { ...s, active: !s.active, updatedAt: new Date().toISOString() } : s)
    localStorage.setItem('services_list', JSON.stringify(updated))
    setServices(updated)
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const updated = services.filter((s) => s.id !== id)
    localStorage.setItem('services_list', JSON.stringify(updated))
    setServices(updated)
  }

  // KPIs
  const active   = services.filter((s) => s.active)
  const avgPrice = services.length ? Math.round(services.reduce((a, s) => a + s.basePrice, 0) / services.length) : 0
  const topUsed  = services.reduce((a, b) => (a.usageCount ?? 0) >= (b.usageCount ?? 0) ? a : b, services[0])

  const filtered = services.filter((s) => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    const matchCat    = !catFilter || s.category === catFilter
    return matchSearch && matchCat
  })

  const categories = Array.from(new Set(services.map((s) => s.category)))

  const columns: ColumnDef<StoredService, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Servicio',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-text-primary">{row.original.name}</p>
          {row.original.description && <p className="text-xs text-text-muted truncate max-w-xs">{row.original.description}</p>}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }) => (
        <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-secondary">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'basePrice',
      header: 'Precio base',
      cell: ({ row }) => <span className="font-medium text-text-primary">{formatCurrency(row.original.basePrice)}</span>,
    },
    {
      accessorKey: 'estimatedHours',
      header: 'Tiempo est.',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary">
          {row.original.estimatedHours ? `${row.original.estimatedHours} hr${row.original.estimatedHours !== 1 ? 's' : ''}` : '—'}
        </span>
      ),
    },
    {
      id: 'parts',
      header: 'Refacciones',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <Package size={12} />
          {row.original.requiredParts?.length ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Estatus',
      cell: ({ row }) => (
        <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleActive(row.original.id) }}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
            row.original.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-surface-secondary text-text-muted hover:bg-slate-200'
          }`}>
          {row.original.active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
          {row.original.active ? 'Activo' : 'Inactivo'}
        </button>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/services/${row.original.id}/edit`) }}
            className="rounded-lg p-1.5 text-text-muted hover:bg-brand/10 hover:text-brand transition-colors" title="Editar">
            <Pencil size={14} />
          </button>
          <button type="button"
            onClick={(e) => handleDelete(e, row.original.id)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Servicios"
        description="Catálogo de servicios del taller"
        actions={
          <button onClick={() => navigate('/services/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Nuevo Servicio
          </button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Total de servicios" value={services.length} sub="En el catálogo" icon={Scissors} />
        <KpiCard label="Servicios activos" value={active.length} sub={`${services.length - active.length} inactivos`} icon={ToggleRight} iconColor="text-status-completed" />
        <KpiCard label="Precio promedio" value={formatCurrency(avgPrice)} sub="Por servicio" icon={Package} iconColor="text-status-progress" />
        <KpiCard label="Más solicitado" value={topUsed?.usageCount ?? 0} sub={topUsed?.name ?? '—'} icon={Scissors} iconColor="text-status-pending" />
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <SearchInput placeholder="Buscar por nombre o categoría…" onChange={setSearch} />

          {/* Category filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!catFilter ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary hover:bg-slate-200'}`}>
              Todos
            </button>
            {categories.map((c) => (
              <button key={c} onClick={() => setCatFilter(c === catFilter ? '' : c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${catFilter === c ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary hover:bg-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && services.length === 0 ? (
          <EmptyState icon={Scissors} message="No hay servicios registrados" description="Agrega los servicios que ofrece tu taller" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Scissors} message="Sin resultados" description="Intenta con otros filtros" />
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            globalFilter={search}
            onRowClick={(s) => navigate(`/services/${s.id}/edit`)}
          />
        )}
      </div>
    </div>
  )
}
