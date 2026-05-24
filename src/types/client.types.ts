export interface Client {
  id: string
  name: string
  email?: string
  phone: string
  rfc?: string
  company?: string
  address?: string
  vehicleCount?: number
  lastVisit?: string
  totalSpent?: number
  createdAt: string
}

export interface Vehicle {
  id: string
  clientId: string
  clientName?: string
  brand: string
  model: string
  year: number
  plate: string
  vin?: string
  color?: string
  mileage?: number
  engine?: string
  transmission?: string
  lastService?: string
  createdAt: string
}

export interface Appointment {
  id: string
  clientId: string
  clientName: string
  vehicleId: string
  vehiclePlate: string
  vehicleModel: string
  date: string
  time: string
  serviceType: string
  notes?: string
  status: 'Programada' | 'Confirmada' | 'Completada' | 'Cancelada'
  createdAt: string
}
