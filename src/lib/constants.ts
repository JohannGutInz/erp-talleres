export const PAGINATION_OPTIONS = [5, 10, 25, 50]
export const DEFAULT_PAGE_SIZE = 10

export const ROUTES = {
  HOME: '/',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  APPOINTMENTS: '/appointments',
  QUOTES: '/quotes',
  CLIENTS: '/clients',
  VEHICLES: '/vehicles',
  SERVICES: '/services',
  BILLING_RECEIPTS: '/billing/receipts',
  BILLING_PAYMENTS: '/billing/payments',
  BILLING_INVOICES: '/billing/invoices',
  BILLING_COMMISSIONS: '/billing/commissions',
  BILLING_SALES_BOOK: '/billing/sales-book',
  SUPPLIERS: '/inventory/suppliers',
  PARTS: '/inventory/parts',
  PURCHASE_ORDERS: '/inventory/purchase-orders',
  CREDITS: '/inventory/credits',
} as const

export const ORDER_STATUSES = ['Pendiente', 'En progreso', 'Completada', 'Cancelada'] as const
