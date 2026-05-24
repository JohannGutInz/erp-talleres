import { useEffect } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Phone, MapPin, MessageCircle } from 'lucide-react'
import type { ClientFormValues } from '@/types/client-form.types'
import { MEXICAN_STATES } from '@/types/client-form.types'
import { ClientSectionCard } from './ClientSectionCard'

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors disabled:bg-surface-secondary disabled:cursor-not-allowed'

export function SectionContact() {
  const { register, watch, setValue, control } = useFormContext<ClientFormValues>()

  const mainPhone = watch('phone')
  const useMainAsWhatsapp = watch('useMainPhoneAsWhatsapp')

  useEffect(() => {
    if (useMainAsWhatsapp) setValue('whatsapp', mainPhone || '')
  }, [useMainAsWhatsapp, mainPhone, setValue])

  return (
    <ClientSectionCard icon={Phone} title="Contacto" subtitle="Información de contacto adicional y ubicación" collapsible defaultOpen={false}>
      <div className="mt-5 space-y-5">
        {/* Phones row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Teléfono secundario</label>
            <input {...register('phone2')} type="tel" placeholder="Alternativo" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">WhatsApp</label>
            <div className="relative">
              <MessageCircle size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              <input
                {...register('whatsapp')}
                type="tel"
                placeholder="Número de WhatsApp"
                disabled={useMainAsWhatsapp}
                className={`${input} pl-9`}
              />
            </div>
          </div>
        </div>

        {/* Use main as WhatsApp */}
        <Controller
          name="useMainPhoneAsWhatsapp"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-surface-border px-4 py-3 hover:bg-surface-secondary/40 transition-colors">
              <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${field.value ? 'bg-brand border-brand' : 'border-surface-border bg-white'}`}>
                {field.value && <svg viewBox="0 0 10 8" className="h-2.5 w-2.5"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <input type="checkbox" className="sr-only" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
              <p className="text-sm text-text-secondary">Usar teléfono principal como WhatsApp</p>
            </label>
          )}
        />

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            <MapPin size={13} className="inline mr-1 text-text-muted" />
            Dirección
          </label>
          <input {...register('address')} placeholder="Calle, número, colonia…" className={input} />
        </div>

        {/* City + State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Ciudad</label>
            <input {...register('city')} placeholder="Culiacán, Monterrey…" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Estado</label>
            <select {...register('state')} className={input}>
              <option value="">— Seleccionar —</option>
              {MEXICAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    </ClientSectionCard>
  )
}
