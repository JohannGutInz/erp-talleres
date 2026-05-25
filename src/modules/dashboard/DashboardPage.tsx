import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench, DollarSign, AlertCircle, Users, FileText,
  TrendingUp, TrendingDown, ClipboardList, Package,
  ChevronRight, Plus, AlertTriangle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { Order } from '@/types/order.types'
import type { Part, Supplier } from '@/types/inventory.types'
import { MOCK_CLIENTS } from '@/lib/mock-data'

// ── Data helpers ──────────────────────────────────────────────────────────

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
}

const STATUS_COLORS: Record<string, string> = {
  Completada:    '#10B981',
  'En progreso': '#3B82F6',
  Pendiente:     '#F59E0B',
  Cancelada:     '#A78BFA',
}

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function greeting(name: string) {
  const h = new Date().getHours()
  const part = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  return `${part}, ${name.split(' ')[0]}`
}

function todayLabel() {
  return new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Tiny trend badge ──────────────────────────────────────────────────────

function Trend({ pct, up = true }: { pct: number; up?: boolean }) {
  const good = up ? pct >= 0 : pct <= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${good ? 'text-status-completed' : 'text-status-danger'}`}>
      {pct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(pct)}%
    </span>
  )
}

// ── KPI card ─────────────────────────────────────────────────────────────

interface KpiProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: { pct: number; up?: boolean }
}

function Kpi({ label, value, sub, icon: Icon, iconBg, iconColor, trend }: KpiProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary leading-none">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
      </div>
      {trend && <Trend pct={trend.pct} up={trend.up} />}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  const { orders, parts, suppliers, clientCount, quoteCount, kpis, pieData, barData, recentOrders, lowStock, pendingOrders } = useMemo(() => {
    const orders:    Order[]    = load('orders_list')
    const parts:     Part[]     = load('parts_list')
    const suppliers: Supplier[] = load('suppliers_list')
    const storedClients         = load<{ id: string }>('clients_list')
    const quotes                = load<{ data: { quoteStatus?: string } }>('quotes_list')

    // KPIs
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear  = now.getFullYear()

    const active     = orders.filter((o) => o.status === 'En progreso' || o.status === 'Pendiente')
    const completed  = orders.filter((o) => o.status === 'Completada')
    const thisMonthCompleted = completed.filter((o) => {
      const d = new Date(o.updatedAt)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    const lastMonthCompleted = completed.filter((o) => {
      const d = new Date(o.updatedAt)
      const lm = thisMonth === 0 ? 11 : thisMonth - 1
      const ly = thisMonth === 0 ? thisYear - 1 : thisYear
      return d.getMonth() === lm && d.getFullYear() === ly
    })
    const ingresosMes  = thisMonthCompleted.reduce((s, o) => s + o.total, 0)
    const ingresosAnt  = lastMonthCompleted.reduce((s, o) => s + o.total, 0)
    const ingresosPct  = ingresosAnt > 0 ? Math.round(((ingresosMes - ingresosAnt) / ingresosAnt) * 100) : 0
    const deudaProv    = suppliers.reduce((s, p) => s + (p.balance ?? 0), 0)
    const clientCount  = MOCK_CLIENTS.length + storedClients.filter((c) => !MOCK_CLIENTS.some((m) => m.id === c.id)).length
    const quoteCount   = quotes.filter((q) => q.data.quoteStatus === 'Pendiente' || q.data.quoteStatus === 'Enviada').length

    // Pie data
    const statusCounts: Record<string, number> = {}
    orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1 })
    const pieData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

    // Bar data — last 6 months
    const barData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(thisYear, thisMonth - (5 - i), 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const rev = completed
        .filter((o) => { const od = new Date(o.updatedAt); return od.getMonth() === m && od.getFullYear() === y })
        .reduce((s, o) => s + o.total, 0)
      const labor = completed
        .filter((o) => { const od = new Date(o.updatedAt); return od.getMonth() === m && od.getFullYear() === y })
        .reduce((s, o) => s + o.totalLabor, 0)
      return { month: MONTHS_ES[m], labor, parts: rev - labor, total: rev }
    })

    // Recent orders (last 5)
    const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

    // Alerts
    const lowStock    = parts.filter((p) => p.stock <= (p.minStock ?? 0))
    const pendingOrders = orders.filter((o) => o.status === 'Pendiente')

    return {
      orders, parts, suppliers, clientCount, quoteCount,
      kpis: { active: active.length, ingresosMes, ingresosPct, deudaProv, completed: completed.length },
      pieData, barData, recentOrders, lowStock, pendingOrders,
    }
  }, [])

  return (
    <div className="space-y-6">

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{greeting(user?.name ?? 'Usuario')}</h1>
          <p className="text-sm text-text-muted mt-0.5 capitalize">{todayLabel()}</p>
        </div>
        <button onClick={() => navigate('/orders/new')}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus size={15} /> Nueva orden
        </button>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <Kpi label="Órdenes activas"     value={kpis.active}
          sub={`${orders.filter(o=>o.status==='En progreso').length} en progreso · ${orders.filter(o=>o.status==='Pendiente').length} pendientes`}
          icon={Wrench}       iconBg="bg-blue-50"    iconColor="text-blue-600" />
        <Kpi label="Ingresos del mes"    value={formatCurrency(kpis.ingresosMes)}
          sub={`${kpis.completed} órdenes completadas`}
          icon={DollarSign}   iconBg="bg-emerald-50" iconColor="text-emerald-600"
          trend={{ pct: kpis.ingresosPct }} />
        <Kpi label="Presupuestos"        value={quoteCount}
          sub="Pendientes / enviados"
          icon={FileText}     iconBg="bg-amber-50"   iconColor="text-amber-600" />
        <Kpi label="Clientes"            value={clientCount}
          sub="En el catálogo"
          icon={Users}        iconBg="bg-brand-light" iconColor="text-brand" />
        <Kpi label="Deuda a proveedores" value={formatCurrency(kpis.deudaProv)}
          sub={`${suppliers.length} proveedores`}
          icon={AlertCircle}  iconBg="bg-red-50"     iconColor="text-red-500"
          trend={{ pct: 0, up: false }} />
      </div>

      {/* ── Charts ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Bar chart */}
        <div className="col-span-2 rounded-xl border border-surface-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">Ingresos por mes</p>
              <p className="text-xs text-text-muted">Últimos 6 meses · mano de obra y refacciones</p>
            </div>
            <span className="text-xs text-text-muted">
              Total: {formatCurrency(barData.reduce((s, d) => s + d.total, 0))}
            </span>
          </div>
          {barData.every((d) => d.total === 0) ? (
            <div className="flex items-center justify-center h-52 text-sm text-text-muted">
              Sin órdenes completadas aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData} barSize={22} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v, name) => [formatCurrency(Number(v)), name === 'labor' ? 'Mano de obra' : 'Refacciones']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                  cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="labor" name="labor"  stackId="a" fill="#F97316" radius={[0,0,0,0]} />
                <Bar dataKey="parts" name="parts"  stackId="a" fill="#FED7AA" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart */}
        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-text-primary mb-1">Órdenes por estatus</p>
          <p className="text-xs text-text-muted mb-2">Total: {orders.length} órdenes</p>
          {orders.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-sm text-text-muted">Sin órdenes</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="status"
                  cx="50%" cy="42%" outerRadius={75} innerRadius={42} paddingAngle={3}>
                  {pieData.map((e) => (
                    <Cell key={e.status} fill={STATUS_COLORS[e.status] ?? '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent orders + Alerts ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent orders */}
        <div className="col-span-2 rounded-xl border border-surface-border bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <p className="text-sm font-semibold text-text-primary">Últimas órdenes</p>
            <button onClick={() => navigate('/orders')}
              className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-medium transition-colors">
              Ver todas <ChevronRight size={13} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">
              No hay órdenes —{' '}
              <button onClick={() => navigate('/orders/new')} className="text-brand underline">crear la primera</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary text-xs text-text-muted uppercase">
                  <th className="px-4 py-2.5 text-left font-medium">No. Orden</th>
                  <th className="px-4 py-2.5 text-left font-medium">Cliente</th>
                  <th className="px-4 py-2.5 text-left font-medium">Vehículo</th>
                  <th className="px-4 py-2.5 text-left font-medium">Estatus</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-left font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} onClick={() => navigate(`/orders/${o.id}/edit`)}
                    className="hover:bg-surface-secondary/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand">{o.number}</td>
                    <td className="px-4 py-3 text-text-primary">{o.clientName}</td>
                    <td className="px-4 py-3">
                      <p className="text-text-primary">{o.vehicleModel}</p>
                      <p className="font-mono text-xs text-text-muted">{o.vehiclePlate}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alerts + Quick actions */}
        <div className="space-y-4">

          {/* Alerts */}
          <div className="rounded-xl border border-surface-border bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border">
              <p className="text-sm font-semibold text-text-primary">Alertas</p>
            </div>
            <div className="divide-y divide-surface-border">
              {lowStock.length === 0 && pendingOrders.length === 0 && quoteCount === 0 ? (
                <div className="px-5 py-4 text-xs text-text-muted text-center">Sin alertas pendientes ✓</div>
              ) : (
                <>
                  {pendingOrders.length > 0 && (
                    <button onClick={() => navigate('/orders')}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-surface-secondary text-left transition-colors">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                        <ClipboardList size={14} className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">{pendingOrders.length} órdenes pendientes</p>
                        <p className="text-xs text-text-muted">Sin técnico asignado</p>
                      </div>
                      <ChevronRight size={14} className="text-text-muted shrink-0 mt-1" />
                    </button>
                  )}
                  {lowStock.length > 0 && (
                    <button onClick={() => navigate('/inventory/parts')}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-surface-secondary text-left transition-colors">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <Package size={14} className="text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">{lowStock.length} refacciones con bajo stock</p>
                        <p className="text-xs text-text-muted truncate">{lowStock.slice(0, 2).map(p => p.name).join(', ')}{lowStock.length > 2 ? '…' : ''}</p>
                      </div>
                      <ChevronRight size={14} className="text-text-muted shrink-0 mt-1" />
                    </button>
                  )}
                  {quoteCount > 0 && (
                    <button onClick={() => navigate('/quotes')}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-surface-secondary text-left transition-colors">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <FileText size={14} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">{quoteCount} presupuestos sin atender</p>
                        <p className="text-xs text-text-muted">Pendientes o enviados</p>
                      </div>
                      <ChevronRight size={14} className="text-text-muted shrink-0 mt-1" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-surface-border bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border">
              <p className="text-sm font-semibold text-text-primary">Acciones rápidas</p>
            </div>
            <div className="divide-y divide-surface-border">
              {[
                { label: 'Nueva orden de trabajo', icon: ClipboardList, path: '/orders/new' },
                { label: 'Nuevo presupuesto',      icon: FileText,      path: '/quotes/new'  },
                { label: 'Registrar cliente',      icon: Users,         path: '/clients/new' },
                { label: 'Nueva orden de compra',  icon: Package,       path: '/inventory/purchase-orders/new' },
              ].map(({ label, icon: Icon, path }) => (
                <button key={path} onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-secondary text-left transition-colors">
                  <Icon size={14} className="text-brand shrink-0" />
                  <span className="text-sm text-text-secondary">{label}</span>
                  <ChevronRight size={13} className="text-text-muted ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
