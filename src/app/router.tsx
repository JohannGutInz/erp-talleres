import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import DashboardPage      from '@/modules/dashboard/DashboardPage'
import OrdersPage         from '@/modules/orders/OrdersPage'
import NewOrderPage       from '@/modules/orders/NewOrderPage'
import AppointmentsPage   from '@/modules/orders/AppointmentsPage'
import QuotesPage         from '@/modules/quotes/QuotesPage'
import NewQuotePage       from '@/modules/quotes/NewQuotePage'
import ClientsPage        from '@/modules/clients/ClientsPage'
import NewClientPage      from '@/modules/clients/NewClientPage'
import VehiclesPage       from '@/modules/vehicles/VehiclesPage'
import NewVehiclePage     from '@/modules/vehicles/NewVehiclePage'
import ServicesPage       from '@/modules/services/ServicesPage'
import NewServicePage     from '@/modules/services/NewServicePage'
import ReceiptsPage       from '@/modules/billing/ReceiptsPage'
import PaymentsPage       from '@/modules/billing/PaymentsPage'
import InvoicesPage       from '@/modules/billing/InvoicesPage'
import CommissionsPage    from '@/modules/billing/CommissionsPage'
import SalesBookPage      from '@/modules/billing/SalesBookPage'
import SuppliersPage      from '@/modules/inventory/SuppliersPage'
import NewSupplierPage    from '@/modules/inventory/NewSupplierPage'
import PartsPage          from '@/modules/inventory/PartsPage'
import NewPartPage        from '@/modules/inventory/NewPartPage'
import PurchaseOrdersPage from '@/modules/inventory/PurchaseOrdersPage'
import NewPurchaseOrderPage from '@/modules/inventory/NewPurchaseOrderPage'
import CreditsPage        from '@/modules/inventory/CreditsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true,                                      element: <DashboardPage />         },
          { path: 'orders',                                   element: <OrdersPage />            },
          { path: 'orders/new',                               element: <NewOrderPage />          },
          { path: 'orders/:id/edit',                          element: <NewOrderPage />          },
          { path: 'appointments',                             element: <AppointmentsPage />      },
          { path: 'quotes',                                   element: <QuotesPage />            },
          { path: 'quotes/new',                               element: <NewQuotePage />          },
          { path: 'clients',                                  element: <ClientsPage />           },
          { path: 'clients/new',                              element: <NewClientPage />         },
          { path: 'clients/:id/edit',                         element: <NewClientPage />         },
          { path: 'vehicles',                                 element: <VehiclesPage />          },
          { path: 'vehicles/new',                             element: <NewVehiclePage />        },
          { path: 'vehicles/:id/edit',                        element: <NewVehiclePage />        },
          { path: 'services',                                 element: <ServicesPage />          },
          { path: 'services/new',                             element: <NewServicePage />        },
          { path: 'services/:id/edit',                        element: <NewServicePage />        },
          { path: 'billing/receipts',                         element: <ReceiptsPage />          },
          { path: 'billing/payments',                         element: <PaymentsPage />          },
          { path: 'billing/invoices',                         element: <InvoicesPage />          },
          { path: 'billing/commissions',                      element: <CommissionsPage />       },
          { path: 'billing/sales-book',                       element: <SalesBookPage />         },
          { path: 'inventory/suppliers',                      element: <SuppliersPage />         },
          { path: 'inventory/suppliers/new',                  element: <NewSupplierPage />       },
          { path: 'inventory/suppliers/:id/edit',             element: <NewSupplierPage />       },
          { path: 'inventory/parts',                          element: <PartsPage />             },
          { path: 'inventory/parts/new',                      element: <NewPartPage />           },
          { path: 'inventory/parts/:id/edit',                 element: <NewPartPage />           },
          { path: 'inventory/purchase-orders',                element: <PurchaseOrdersPage />    },
          { path: 'inventory/purchase-orders/new',            element: <NewPurchaseOrderPage />  },
          { path: 'inventory/purchase-orders/:id/edit',       element: <NewPurchaseOrderPage />  },
          { path: 'inventory/credits',                        element: <CreditsPage />           },
        ],
      },
    ],
  },
])
