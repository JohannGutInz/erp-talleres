export type PartUnit = 'pieza' | 'litro' | 'set' | 'kit' | 'metro' | 'par'

export const PART_CATEGORIES = [
  'Lubricantes', 'Filtros', 'Frenos', 'Encendido', 'Eléctrico',
  'Suspensión', 'Transmisión', 'Motor', 'Carrocería', 'Llantas', 'Otro',
] as const

export interface Part {
  id:           string
  sku:          string
  name:         string
  description?: string
  category:     string
  brand?:       string
  supplierId?:  string
  supplierName?: string
  stock:        number
  minStock:     number
  price:        number       // precio de venta al cliente
  cost:         number       // costo de compra al proveedor
  unit?:        PartUnit
  location?:    string       // ubicación en almacén (ej. "Estante A-3")
  createdAt:    string
  updatedAt:    string
}

export interface Supplier {
  id:          string
  name:        string
  contact?:    string
  phone?:      string
  email?:      string
  rfc?:        string
  address?:    string
  city?:       string
  creditDays?: number        // plazo de pago en días
  balance:     number        // saldo pendiente con el proveedor
  notes?:      string
  createdAt:   string
}

// ── Purchase Orders ────────────────────────────────────────────────
export type PurchaseOrderStatus =
  | 'Borrador'
  | 'Enviada'
  | 'Parcialmente recibida'
  | 'Recibida'
  | 'Cancelada'

export interface PurchaseOrder {
  id:            string
  number:        string
  supplierId:    string
  supplierName:  string
  status:        PurchaseOrderStatus
  items:         PurchaseOrderItem[]
  subtotal:      number
  tax:           number       // IVA (16%)
  total:         number
  paid:          number       // total abonado
  balance:       number       // total − paid
  notes?:        string
  expectedDate?: string
  createdAt:     string
  receivedAt?:   string
}

export interface PurchaseOrderItem {
  id:        string
  partId:    string
  partName:  string
  sku:       string
  quantity:  number
  cost:      number           // costo unitario pactado
  received:  number           // unidades efectivamente recibidas
}

// ── Credits / Abonos ───────────────────────────────────────────────
export type CreditPaymentMethod =
  | 'Efectivo'
  | 'Transferencia'
  | 'Cheque'
  | 'Tarjeta de débito'
  | 'Tarjeta de crédito'

export interface Credit {
  id:                   string
  purchaseOrderId:      string
  purchaseOrderNumber:  string
  supplierId:           string
  supplierName:         string
  amount:               number
  method:               CreditPaymentMethod
  date:                 string
  reference?:           string   // no. de transferencia / cheque
  notes?:               string
  createdAt:            string
}

// ── Stock movements (audit log) ────────────────────────────────────
export type StockMovementType = 'Entrada' | 'Salida' | 'Ajuste'

export interface StockMovement {
  id:               string
  partId:           string
  partName:         string
  sku:              string
  type:             StockMovementType
  quantity:         number            // positivo = entrada, negativo = salida
  reason:           string            // 'Orden de compra' | 'Orden de trabajo' | 'Ajuste manual'
  referenceId?:     string
  referenceNumber?: string
  stockBefore:      number
  stockAfter:       number
  createdBy?:       string
  createdAt:        string
}
