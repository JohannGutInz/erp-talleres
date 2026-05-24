import { z } from 'zod'

export const SERVICE_CATEGORIES = [
  'Mantenimiento preventivo',
  'Mecánica general',
  'Motor',
  'Transmisión',
  'Frenos',
  'Suspensión y dirección',
  'Eléctrica y electrónica',
  'Diagnóstico',
  'A/C y climatización',
  'Carrocería y pintura',
  'Llantas y alineación',
  'Otro',
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

const optNum = (min = 0) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v as number)) ? undefined : Number(v)),
    z.number().min(min).optional()
  )

export const requiredPartSchema = z.object({
  partId:   z.string(),
  partName: z.string(),
  sku:      z.string().default(''),
  quantity: z.number().min(1, 'Mín. 1'),
})

export const serviceFormSchema = z.object({
  name:           z.string().min(2, 'Nombre requerido'),
  category:       z.string().min(1, 'Categoría requerida'),
  description:    z.string().optional(),
  basePrice:      z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number({ invalid_type_error: 'Precio requerido' }).min(0, 'Precio inválido')
  ),
  estimatedHours: optNum(),
  requiredParts:  z.array(requiredPartSchema).default([]),
  active:         z.boolean().default(true),
  notes:          z.string().optional(),
})

export type ServiceFormValues    = z.infer<typeof serviceFormSchema>
export type ServiceRequiredPart  = z.infer<typeof requiredPartSchema>

export interface StoredService extends ServiceFormValues {
  id:        string
  usageCount: number
  createdAt: string
  updatedAt: string
}
