import { z } from 'zod'

export type QuoteStatus =
  | 'Pendiente'
  | 'Enviada'
  | 'Aprobada'
  | 'Rechazada'
  | 'En proceso'
  | 'Concluida'

export type DiagnosisPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente'

const optionalNumber = (min = 0) =>
  z.preprocess(
    (v) =>
      v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v as number))
        ? undefined
        : Number(v),
    z.number().min(min).optional()
  ) as z.ZodType<number | undefined>

const laborItemSchema = z.object({
  id: z.string(),
  service: z.string().min(1, 'Descripción requerida'),
  hours: z.number().min(0),
  unitPrice: z.number().min(0),
})

const partItemSchema = z.object({
  id: z.string(),
  partId: z.string().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  sku: z.string().optional(),
  quantity: z.number().min(1, 'Mín. 1'),
  unitPrice: z.number().min(0),
  availableStock: z.number().optional(),
})

export const quoteFormSchema = z
  .object({
    clientId: z.string().optional(),
    clientPhone: z.string().min(10, 'Ingresa al menos 10 dígitos'),
    clientName: z.string().min(2, 'Nombre requerido'),
    needsInvoice: z.boolean(),
    clientEmail: z.string().optional(),
    clientRfc: z.string().optional(),
    clientCompany: z.string().optional(),
    clientAddress: z.string().optional(),

    vehicleId: z.string().optional(),
    vehiclePlate: z.string().min(1, 'Placa requerida'),
    vehicleVin: z.string().optional(),
    vehicleBrand: z.string().min(1, 'Marca requerida'),
    vehicleModel: z.string().min(1, 'Modelo requerido'),
    vehicleYear: z.number({ error: 'Año requerido' }).min(1950).max(2030),
    vehicleKm: optionalNumber(),
    vehicleColor: z.string().optional(),
    vehicleEngine: z.string().optional(),
    vehicleTransmission: z.string().optional(),

    receptionDate: z.string().optional(),
    advisorId: z.string().optional(),
    fuelLevel: z.number().min(0).max(8),
    entryKm: optionalNumber(),
    damageFront: z.string().optional(),
    damageLeft: z.string().optional(),
    damageRight: z.string().optional(),
    damageDashboard: z.string().optional(),
    damageOther: z.string().optional(),

    problemDescription: z.string().min(10, 'Describe el problema (mín. 10 caracteres)'),
    symptoms: z.array(z.string()),
    issueSince: z.string().optional(),

    diagnosisPreliminary: z.string().optional(),
    diagnosisPriority: z.enum(['Baja', 'Media', 'Alta', 'Urgente']),
    diagnosisRequiresScan: z.boolean(),
    diagnosisEstimatedTime: z.string().optional(),

    laborItems: z.array(laborItemSchema),
    partItems: z.array(partItemSchema),
    discount: z.number().min(0).max(100),

    quoteStatus: z.enum(['Pendiente', 'Enviada', 'Aprobada', 'Rechazada', 'En proceso', 'Concluida']),
    authNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.needsInvoice) {
      if (!data.clientEmail?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email requerido para facturar', path: ['clientEmail'] })
      }
      if (!data.clientRfc?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RFC requerido para facturar', path: ['clientRfc'] })
      }
    }
  })

export type QuoteFormValues = z.infer<typeof quoteFormSchema>
