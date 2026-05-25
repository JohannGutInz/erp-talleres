export type OrderStatus = 'Pendiente' | 'En progreso' | 'Completada' | 'Cancelada'

export interface Order {
  id: string
  number: string
  clientId: string
  clientName: string
  vehicleId: string
  vehiclePlate: string
  vehicleModel: string
  status: OrderStatus
  technicianId?: string
  technicianName?: string
  services: OrderService[]
  parts: OrderPart[]
  totalLabor: number
  totalParts: number
  total: number
  notes?: string
  sourceQuoteNumber?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface OrderService {
  id: string
  serviceId: string
  name: string
  price: number
  quantity: number
}

export interface OrderPart {
  id: string
  partId: string
  name: string
  sku: string
  price: number
  quantity: number
}

export interface OrderFilters {
  status?: OrderStatus
  clientId?: string
  technicianId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
