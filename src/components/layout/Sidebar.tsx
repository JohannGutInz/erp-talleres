import { useState } from 'react'
import {
  Home, Wrench, Clock, FileText, Users, Car, Scissors,
  Receipt, CreditCard, FileSpreadsheet, BadgeDollarSign, BookOpen,
  Truck, Package, ShoppingCart, Wallet,
  ChevronDown, ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavItem } from './NavItem'
import { cn } from '@/lib/utils'

interface SidebarSection {
  label: string
  items: { to: string; icon: LucideIcon; label: string }[]
}

const SECTIONS: SidebarSection[] = [
  {
    label: 'Atención al cliente',
    items: [
      { to: '/quotes',       icon: FileText,          label: 'Presupuestos'       },
      { to: '/orders',       icon: Wrench,           label: 'Órdenes De Trabajo' },
      { to: '/appointments', icon: Clock,             label: 'Citas'              },
      { to: '/clients',      icon: Users,             label: 'Clientes'           },
      { to: '/vehicles',     icon: Car,               label: 'Vehículos'          },
      { to: '/services',     icon: Scissors,          label: 'Servicios'          },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/billing/receipts',    icon: Receipt,          label: 'Facturas'         },
      { to: '/billing/payments',    icon: CreditCard,       label: 'Pagos'           },
      // { to: '/billing/invoices',    icon: FileSpreadsheet,  label: 'Notas de credito'  },
      { to: '/billing/sales-book',  icon: BookOpen,         label: 'Estado de cuentas' },
      { to: '/billing/commissions', icon: BadgeDollarSign,  label: 'Nomina'      },
    ],
  },
  {
    label: 'Compras',
    items: [
      { to: '/inventory/suppliers',       icon: Truck,         label: 'Proveedores'        },
      { to: '/inventory/parts',           icon: Package,       label: 'Refacciones'          },
      { to: '/inventory/purchase-orders', icon: ShoppingCart,  label: 'Órdenes De Compra'  },
      { to: '/inventory/credits',         icon: Wallet,        label: 'Abonos'             },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
}

function SectionGroup({ section, collapsed }: { section: SidebarSection; collapsed: boolean }) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      {!collapsed && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider hover:text-text-secondary transition-colors"
        >
          {section.label}
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
      )}
      {(open || collapsed) && (
        <div className="flex flex-col gap-0.5">
          {section.items.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-full flex flex-col border-r border-surface-border bg-white transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      <div className={cn('flex items-center h-14 border-b border-surface-border px-4', collapsed && 'justify-center px-0')}>
        {collapsed ? (
          <span className="text-brand font-bold text-lg">T</span>
        ) : (
          <span className="font-bold text-text-primary text-base">
            tall<span className="text-brand">ERP</span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-4">
        <NavItem to="/" icon={Home} label="Inicio" collapsed={collapsed} />
        {SECTIONS.map((s) => (
          <SectionGroup key={s.label} section={s} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  )
}
