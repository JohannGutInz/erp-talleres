import { useFormContext } from 'react-hook-form'
import type { QuoteFormValues } from '@/types/quote.types'
import { SectionCard } from './SectionCard'

// These keys will later be linked to service catalog entries
const SYMPTOM_CATEGORIES = [
  {
    key: 'motor',
    label: 'Motor',
    symptoms: [
      { key: 'check_engine',      label: 'Check engine'         },
      { key: 'power_loss',        label: 'Pérdida de potencia'  },
      { key: 'overheating',       label: 'Sobrecalentamiento'   },
      { key: 'smoke',             label: 'Humo'                 },
      { key: 'high_consumption',  label: 'Consumo excesivo'     },
      { key: 'jaloneos',          label: 'Jaloneos'             },
    ],
  },
  {
    key: 'suspension',
    label: 'Suspensión',
    symptoms: [
      { key: 'vibration',         label: 'Vibración'            },
      { key: 'suspension_noise',  label: 'Ruido suspensión'     },
      { key: 'pulling',           label: 'Se va de lado'        },
      { key: 'knocking',          label: 'Golpeteo'             },
    ],
  },
  {
    key: 'brakes',
    label: 'Frenos',
    symptoms: [
      { key: 'squeal',            label: 'Chirrido'             },
      { key: 'spongy_pedal',      label: 'Pedal esponjoso'      },
      { key: 'uneven_braking',    label: 'Frenado irregular'    },
    ],
  },
  {
    key: 'electrical',
    label: 'Eléctrico',
    symptoms: [
      { key: 'battery',           label: 'Batería'              },
      { key: 'dashboard_lights',  label: 'Luces tablero'        },
      { key: 'screen',            label: 'Pantalla'             },
      { key: 'sensors',           label: 'Sensores'             },
    ],
  },
]

const CATEGORY_STYLES: Record<string, string> = {
  motor:      'border-orange-200 bg-orange-50',
  suspension: 'border-blue-200 bg-blue-50',
  brakes:     'border-red-200 bg-red-50',
  electrical: 'border-yellow-200 bg-yellow-50',
}

const CATEGORY_HEADER: Record<string, string> = {
  motor:      'text-orange-700',
  suspension: 'text-blue-700',
  brakes:     'text-red-700',
  electrical: 'text-yellow-700',
}

export function SectionProblem() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<QuoteFormValues>()
  const symptoms = watch('symptoms') ?? []

  function toggle(key: string) {
    if (symptoms.includes(key)) {
      setValue('symptoms', symptoms.filter((s) => s !== key))
    } else {
      setValue('symptoms', [...symptoms, key])
    }
  }

  return (
    <SectionCard number={4} title="Descripción del problema" subtitle="Lo que reporta el cliente">
      <div className="space-y-5">
        {/* Free-text description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Problema reportado <span className="text-status-danger">*</span>
          </label>
          <textarea
            {...register('problemDescription')}
            rows={3}
            placeholder="Describe el problema que reporta el cliente: qué pasa, en qué condiciones, con qué frecuencia…"
            className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
          />
          {errors.problemDescription && (
            <p className="mt-1 text-xs text-status-danger">{errors.problemDescription.message}</p>
          )}
        </div>

        {/* Symptom categories */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">
            Síntomas presentes
            {symptoms.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                {symptoms.length} seleccionado{symptoms.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SYMPTOM_CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                className={`rounded-xl border p-4 ${CATEGORY_STYLES[cat.key]}`}
              >
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${CATEGORY_HEADER[cat.key]}`}>
                  {cat.label}
                </p>
                <div className="space-y-2">
                  {cat.symptoms.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/60 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={symptoms.includes(key)}
                        onChange={() => toggle(key)}
                        className="h-3.5 w-3.5 rounded border-surface-border text-brand focus:ring-brand"
                      />
                      <span className="text-sm text-text-primary">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-medium text-text-secondary mb-1">¿Desde cuándo presenta la falla?</label>
          <input
            {...register('issueSince')}
            type="date"
            className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
      </div>
    </SectionCard>
  )
}
