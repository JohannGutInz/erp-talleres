import { useFormContext, Controller } from 'react-hook-form'
import { Receipt, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { ClientFormValues } from '@/types/client-form.types'
import { TAX_REGIMES, CFDI_USES } from '@/types/client-form.types'
import { ClientSectionCard } from './ClientSectionCard'

const input =
  'w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors disabled:bg-surface-secondary disabled:cursor-not-allowed'

const RFC_RE = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i

function RfcStatus({ rfc }: { rfc?: string }) {
  if (!rfc || rfc.trim() === '') return null
  const valid = RFC_RE.test(rfc.trim())
  return valid
    ? <span className="flex items-center gap-1 text-xs text-status-completed mt-1"><CheckCircle2 size={12} />RFC con formato válido</span>
    : <span className="flex items-center gap-1 text-xs text-status-danger mt-1"><XCircle size={12} />Formato incorrecto (ej. GACJ800101H00)</span>
}

export function SectionBilling() {
  const { register, watch, control, formState: { errors }, getValues } = useFormContext<ClientFormValues>()
  const requiresBilling = watch('requiresBilling')
  const rfc = watch('rfc')
  const initiallyOpen = getValues('requiresBilling')

  return (
    <ClientSectionCard
      icon={Receipt}
      title="Facturación"
      subtitle="Datos fiscales para CFDI"
      collapsible
      defaultOpen={initiallyOpen}
      badge={
        requiresBilling
          ? <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">Activo</span>
          : <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-muted">Opcional</span>
      }
    >
      <div className="mt-5 space-y-5">
        {/* Billing toggle */}
        <Controller
          name="requiresBilling"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                field.value ? 'border-brand/40 bg-brand/5' : 'border-surface-border hover:bg-surface-secondary/40'
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Requiere facturación (CFDI)</p>
                <p className="text-xs text-text-muted mt-0.5">Habilita para capturar datos fiscales del cliente</p>
              </div>
              <div className={`relative h-6 w-11 rounded-full transition-colors ${field.value ? 'bg-brand' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          )}
        />

        {requiresBilling && (
          <div className="rounded-xl border border-surface-border/80 bg-surface-secondary/30 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Datos fiscales</p>

            {/* RFC */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                RFC <span className="text-status-danger">*</span>
              </label>
              <input {...register('rfc')} placeholder="GACJ800101H00" className={`${input} uppercase font-mono tracking-wider`} />
              <RfcStatus rfc={rfc} />
              {errors.rfc && <p className="mt-1 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.rfc.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Razón social */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Razón social <span className="text-status-danger">*</span>
                </label>
                <input {...register('taxName')} placeholder="Nombre fiscal completo" className={input} />
                {errors.taxName && <p className="mt-1 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.taxName.message}</p>}
              </div>

              {/* Régimen fiscal */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Régimen fiscal</label>
                <select {...register('taxRegime')} className={input}>
                  <option value="">— Seleccionar —</option>
                  {TAX_REGIMES.map((r) => (
                    <option key={r.code} value={r.code}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Uso CFDI */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Uso CFDI</label>
                <select {...register('taxCfdiUse')} className={input}>
                  <option value="">— Seleccionar —</option>
                  {CFDI_USES.map((u) => (
                    <option key={u.code} value={u.code}>{u.label}</option>
                  ))}
                </select>
              </div>

              {/* Tax zip */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Código postal fiscal <span className="text-status-danger">*</span>
                </label>
                <input {...register('taxZip')} placeholder="80000" maxLength={5} className={input} />
                {errors.taxZip && <p className="mt-1 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.taxZip.message}</p>}
              </div>
            </div>

            {/* Tax email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Correo para facturación <span className="text-status-danger">*</span>
              </label>
              <input {...register('taxEmail')} type="email" placeholder="facturacion@empresa.com" className={input} />
              {errors.taxEmail && <p className="mt-1 text-xs text-status-danger flex items-center gap-1"><AlertTriangle size={11} />{errors.taxEmail.message}</p>}
            </div>
          </div>
        )}
      </div>
    </ClientSectionCard>
  )
}
