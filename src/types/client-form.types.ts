import { z } from 'zod'

const optNum = (min = 0) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v as number)) ? undefined : Number(v)),
    z.number().min(min).optional()
  ) as z.ZodType<number | undefined>

export const vehicleEntrySchema = z.object({
  id: z.string(),
  plate: z.string().min(1, 'Placa requerida'),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  year: optNum(1900),
  vin: z.string().optional(),
  mileage: optNum(0),
})

export type VehicleEntry = z.infer<typeof vehicleEntrySchema>

export const clientFormSchema = z
  .object({
    // Section 1
    clientType: z.enum(['fisica', 'empresa']),
    name: z.string().min(2, 'Nombre requerido (mín. 2 caracteres)'),
    phone: z.string().min(10, 'Teléfono requerido (mín. 10 dígitos)'),
    email: z.union([z.string().email('Correo electrónico inválido'), z.literal('')]).optional(),
    company: z.string().optional(),
    isFrequent: z.boolean(),
    // Section 2
    phone2: z.string().optional(),
    whatsapp: z.string().optional(),
    useMainPhoneAsWhatsapp: z.boolean(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    // Section 3
    requiresBilling: z.boolean(),
    rfc: z.string().optional(),
    taxName: z.string().optional(),
    taxRegime: z.string().optional(),
    taxCfdiUse: z.string().optional(),
    taxEmail: z.string().optional(),
    taxZip: z.string().optional(),
    // Section 4
    vehicles: z.array(vehicleEntrySchema),
    // Section 5
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.requiresBilling) {
      if (!data.rfc?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RFC requerido', path: ['rfc'] })
      if (!data.taxName?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Razón social requerida', path: ['taxName'] })
      if (!data.taxEmail?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Correo fiscal requerido', path: ['taxEmail'] })
      if (!data.taxZip?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Código postal requerido', path: ['taxZip'] })
    }
  })

export type ClientFormValues = z.infer<typeof clientFormSchema>

export const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
]

export const TAX_REGIMES = [
  { code: '601', label: 'General de Ley Personas Morales' },
  { code: '612', label: 'Personas Físicas con Act. Empresariales y Profesionales' },
  { code: '616', label: 'Sin obligaciones fiscales' },
  { code: '621', label: 'Incorporación Fiscal' },
  { code: '626', label: 'Régimen Simplificado de Confianza (RESICO)' },
  { code: '605', label: 'Sueldos y Salarios e Ingresos Asimilados' },
  { code: '606', label: 'Arrendamiento' },
  { code: '608', label: 'Demás ingresos' },
]

export const CFDI_USES = [
  { code: 'G01', label: 'G01 – Adquisición de mercancias' },
  { code: 'G03', label: 'G03 – Gastos en general' },
  { code: 'I03', label: 'I03 – Equipo de transporte' },
  { code: 'I04', label: 'I04 – Equipo de cómputo y accesorios' },
  { code: 'D01', label: 'D01 – Honorarios médicos y gastos hospitalarios' },
  { code: 'P01', label: 'P01 – Por definir' },
  { code: 'S01', label: 'S01 – Sin efectos fiscales' },
  { code: 'CP01', label: 'CP01 – Pagos' },
]
