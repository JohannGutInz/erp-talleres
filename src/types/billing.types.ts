export interface Invoice {
  id: string
  folio: string
  orderId: string
  orderNumber: string
  clientId: string
  clientName: string
  clientRfc: string
  uuid?: string
  subtotal: number
  iva: number
  total: number
  status: 'Borrador' | 'Timbrada' | 'Cancelada'
  paymentMethod: string
  paymentForm: string
  cfdiUse: string
  issuedAt?: string
  createdAt: string
}

export interface Receipt {
  id: string
  number: string
  orderId: string
  orderNumber: string
  clientId: string
  clientName: string
  amount: number
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque'
  notes?: string
  createdAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  invoiceFolio: string
  amount: number
  method: string
  date: string
  reference?: string
}
