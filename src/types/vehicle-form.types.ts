import { z } from 'zod'

const optNum = (min = 0) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v as number)) ? undefined : Number(v)),
    z.number().min(min).optional()
  ) as z.ZodType<number | undefined>

export const vehicleFormSchema = z.object({
  // Section 1
  clientId: z.string().min(1, 'Selecciona un cliente'),
  clientName: z.string().optional(),
  // Section 2
  plate: z.string().min(1, 'Placa requerida'),
  vin: z.string().optional(),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  submodel: z.string().optional(),
  year: optNum(1900),
  color: z.string().optional(),
  mileage: optNum(0),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  // Section 3
  engine: z.string().optional(),
  cylinders: z.string().optional(),
  driveType: z.string().optional(),
  economicNumber: z.string().optional(),
  insurer: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  policyNumber: z.string().optional(),
  // Section 4
  fuelLevel: z.number().min(0).max(8),
  generalCondition: z.enum(['Excelente', 'Bueno', 'Regular', 'Malo', '']).optional(),
  receptionDate: z.string().optional(),
  visibleDamage: z.string().optional(),
  valuableObjects: z.string().optional(),
  checklistExterior: z.array(z.string()),
  checklistInterior: z.array(z.string()),
  // Section 6
  notes: z.string().optional(),
})

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>

export interface SearchableClient {
  id: string
  name: string
  phone: string
  rfc?: string
  vehicleCount: number
  isFrequent?: boolean
  requiresBilling?: boolean
}

export const FUEL_TYPES = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico', 'Gas']
export const TRANSMISSIONS = ['Automática', 'Manual', 'CVT', 'Otra']
export const DRIVE_TYPES = ['FWD', 'RWD', '4WD', 'AWD']
export const CYLINDER_OPTIONS = ['3', '4', '5', '6', '8', '10', '12', 'Eléctrico']
export const CONDITION_OPTIONS = [
  { value: 'Excelente', color: 'text-status-completed bg-emerald-50 border-emerald-200 hover:border-emerald-400' },
  { value: 'Bueno',     color: 'text-status-progress bg-blue-50   border-blue-200   hover:border-blue-400'   },
  { value: 'Regular',   color: 'text-status-pending  bg-amber-50  border-amber-200  hover:border-amber-400'  },
  { value: 'Malo',      color: 'text-status-danger   bg-red-50    border-red-200    hover:border-red-400'    },
] as const

export const CHECKLIST_EXTERIOR = [
  { key: 'defensa',   label: 'Defensa'   },
  { key: 'faros',     label: 'Faros'     },
  { key: 'espejos',   label: 'Espejos'   },
  { key: 'rines',     label: 'Rines'     },
  { key: 'cristales', label: 'Cristales' },
  { key: 'pintura',   label: 'Pintura'   },
]

export const CHECKLIST_INTERIOR = [
  { key: 'pantalla',         label: 'Pantalla'        },
  { key: 'estereo',          label: 'Estéreo'         },
  { key: 'tapetes',          label: 'Tapetes'         },
  { key: 'herramientas',     label: 'Herramientas'    },
  { key: 'gato',             label: 'Gato'            },
  { key: 'llanta_refaccion', label: 'Llanta refacción'},
]

export const CAR_COLORS = [
  { name: 'Blanco',  hex: '#F8FAFC' },
  { name: 'Negro',   hex: '#0F172A' },
  { name: 'Gris',    hex: '#94A3B8' },
  { name: 'Plata',   hex: '#CBD5E1' },
  { name: 'Rojo',    hex: '#EF4444' },
  { name: 'Azul',    hex: '#3B82F6' },
  { name: 'Verde',   hex: '#10B981' },
  { name: 'Amarillo',hex: '#F59E0B' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Café',    hex: '#92400E' },
  { name: 'Beige',   hex: '#D4B896' },
]
