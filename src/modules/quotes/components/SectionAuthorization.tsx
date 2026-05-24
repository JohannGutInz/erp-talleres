import { useFormContext, Controller } from 'react-hook-form'
import { CheckCircle2, Send, ThumbsUp, ThumbsDown, Wrench, Flag } from 'lucide-react'
import type { QuoteFormValues, QuoteStatus } from '@/types/quote.types'
import { SectionCard } from './SectionCard'

const STATUSES: { value: QuoteStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'Pendiente',   label: 'Pendiente',        icon: Flag,          color: 'border-amber-200 bg-amber-50 text-amber-700 data-[active=true]:border-amber-400 data-[active=true]:ring-2 data-[active=true]:ring-amber-200' },
  { value: 'Enviada',     label: 'Enviada',           icon: Send,          color: 'border-blue-200 bg-blue-50 text-blue-700 data-[active=true]:border-blue-400 data-[active=true]:ring-2 data-[active=true]:ring-blue-200' },
  { value: 'Aprobada',    label: 'Aprobada',          icon: ThumbsUp,      color: 'border-emerald-200 bg-emerald-50 text-emerald-700 data-[active=true]:border-emerald-400 data-[active=true]:ring-2 data-[active=true]:ring-emerald-200' },
  { value: 'Rechazada',   label: 'Rechazada',         icon: ThumbsDown,    color: 'border-red-200 bg-red-50 text-red-700 data-[active=true]:border-red-400 data-[active=true]:ring-2 data-[active=true]:ring-red-200' },
  { value: 'En proceso',  label: 'En proceso',        icon: Wrench,        color: 'border-violet-200 bg-violet-50 text-violet-700 data-[active=true]:border-violet-400 data-[active=true]:ring-2 data-[active=true]:ring-violet-200' },
  { value: 'Concluida',   label: 'Concluida',         icon: CheckCircle2,  color: 'border-slate-200 bg-slate-50 text-slate-700 data-[active=true]:border-slate-400 data-[active=true]:ring-2 data-[active=true]:ring-slate-200' },
]

export function SectionAuthorization() {
  const { register, control, watch } = useFormContext<QuoteFormValues>()
  const status = watch('quoteStatus')

  return (
    <SectionCard number={7} title="Autorización" subtitle="Estado y seguimiento de la cotización">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">Estado de la cotización</p>
          <Controller
            name="quoteStatus"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-2">
                {STATUSES.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    data-active={field.value === value}
                    onClick={() => field.onChange(value)}
                    className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${color}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Notas de autorización</label>
          <textarea
            {...register('authNotes')}
            rows={3}
            placeholder="Observaciones sobre la aprobación, motivo de rechazo, condiciones…"
            className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
          />
        </div>

        {status === 'Aprobada' && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-emerald-800">Cotización aprobada</p>
              <p className="text-xs text-emerald-600">Puedes convertirla en una Orden de Trabajo</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-status-completed px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Wrench size={14} />
              Convertir a Orden
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
