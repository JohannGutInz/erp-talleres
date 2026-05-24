import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, pattern, { locale: es })
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
