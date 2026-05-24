import type { QuoteFormValues } from '@/types/quote.types'
import { MOCK_ADVISORS } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  values: QuoteFormValues
  quoteNumber: string
}

const SYMPTOM_LABELS: Record<string, string> = {
  check_engine: 'Check engine', power_loss: 'Pérdida de potencia',
  overheating: 'Sobrecalentamiento', smoke: 'Humo',
  high_consumption: 'Consumo excesivo', jaloneos: 'Jaloneos',
  vibration: 'Vibración', suspension_noise: 'Ruido suspensión',
  pulling: 'Se va de lado', knocking: 'Golpeteo',
  squeal: 'Chirrido en frenos', spongy_pedal: 'Pedal esponjoso',
  uneven_braking: 'Frenado irregular', battery: 'Batería',
  dashboard_lights: 'Luces tablero', screen: 'Pantalla', sensors: 'Sensores',
}

const s = {
  page: { fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", color: '#0F172A', background: 'white', padding: '20px 32px', width: '100%', boxSizing: 'border-box' as const },
  sectionLabel: { fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748B', margin: '0 0 5px 0' },
  card: { border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' },
  cardHeader: { background: '#F8FAFC', padding: '5px 12px', borderBottom: '1px solid #E2E8F0' },
  cardBody: { padding: '8px 12px', lineHeight: '1.65' },
  th: { padding: '6px 10px', textAlign: 'left' as const, fontWeight: '600', fontSize: '10px', letterSpacing: '0.04em' },
  td: { padding: '5px 10px', fontSize: '11px', borderBottom: '1px solid #F1F5F9' },
  tdRight: { padding: '5px 10px', fontSize: '11px', borderBottom: '1px solid #F1F5F9', textAlign: 'right' as const },
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
      <span style={{ color: '#94A3B8', minWidth: '90px', flexShrink: 0 }}>{label}:</span>
      <span style={{ color: '#0F172A', fontWeight: '500' }}>{value}</span>
    </div>
  )
}

function TotalRow({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: bold ? '700' : '400' }}>{label}</span>
      <span style={{ fontSize: bold ? '13px' : '11px', fontWeight: bold ? '800' : '500', color: color ?? '#0F172A' }}>{value}</span>
    </div>
  )
}

export function QuotePrintPreview({ values, quoteNumber }: Props) {
  const advisor = MOCK_ADVISORS.find((a) => a.id === values.advisorId)
  const subtotal =
    values.laborItems.reduce((s, l) => s + (l.hours || 0) * (l.unitPrice || 0), 0) +
    values.partItems.reduce((s, p) => s + (p.quantity || 0) * (p.unitPrice || 0), 0)
  const discountAmt = subtotal * ((values.discount || 0) / 100)
  const tax = (subtotal - discountAmt) * 0.16
  const total = subtotal - discountAmt + tax
  const today = formatDate(new Date().toISOString())

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '14px', borderBottom: '2px solid #F97316' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '16px' }}>🔧</span>
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>tallERP</p>
            <p style={{ fontSize: '10px', color: '#64748B', margin: '1px 0 0' }}>Plataforma de gestión automotriz</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '22px', fontWeight: '900', color: '#F97316', margin: 0, letterSpacing: '-0.5px' }}>COTIZACIÓN</p>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#475569', margin: '2px 0 1px' }}>{quoteNumber}</p>
          <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>Fecha: {today} · Estado: {values.quoteStatus}</p>
        </div>
      </div>

      {/* ── Cliente + Vehículo ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
        <div style={s.card}>
          <div style={s.cardHeader}><p style={s.sectionLabel}>Datos del cliente</p></div>
          <div style={s.cardBody}>
            <InfoRow label="Nombre" value={values.clientName || '—'} />
            <InfoRow label="Teléfono" value={values.clientPhone || '—'} />
            <InfoRow label="Correo" value={values.clientEmail} />
            <InfoRow label="RFC" value={values.clientRfc} />
            <InfoRow label="Empresa" value={values.clientCompany} />
            <InfoRow label="Dirección" value={values.clientAddress} />
          </div>
        </div>
        <div style={s.card}>
          <div style={s.cardHeader}><p style={s.sectionLabel}>Vehículo</p></div>
          <div style={s.cardBody}>
            <InfoRow label="Marca / Modelo" value={[values.vehicleBrand, values.vehicleModel].filter(Boolean).join(' ') || '—'} />
            <InfoRow label="Año" value={values.vehicleYear ? String(values.vehicleYear) : undefined} />
            <InfoRow label="Placas" value={values.vehiclePlate || '—'} />
            <InfoRow label="VIN" value={values.vehicleVin} />
            <InfoRow label="Color" value={values.vehicleColor} />
            <InfoRow label="Motor" value={values.vehicleEngine} />
            <InfoRow label="Km entrada" value={values.entryKm ? values.entryKm.toLocaleString('es-MX') + ' km' : undefined} />
            <InfoRow label="Asesor" value={advisor?.name} />
          </div>
        </div>
      </div>

      {/* ── Problema + síntomas ── */}
      {(values.problemDescription || values.symptoms?.length > 0) && (
        <div style={{ ...s.card, marginBottom: '10px' }}>
          <div style={s.cardHeader}><p style={s.sectionLabel}>Problema reportado</p></div>
          <div style={s.cardBody}>
            {values.problemDescription && (
              <p style={{ fontSize: '11px', lineHeight: '1.5', margin: values.symptoms?.length > 0 ? '0 0 6px' : '0', color: '#0F172A' }}>
                {values.problemDescription}
              </p>
            )}
            {values.symptoms?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {values.symptoms.map((k) => (
                  <span key={k} style={{ display: 'inline-block', padding: '1px 8px', borderRadius: '20px', border: '1px solid #E2E8F0', fontSize: '10px', color: '#475569', background: '#F8FAFC' }}>
                    {SYMPTOM_LABELS[k] ?? k}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mano de obra ── */}
      {values.laborItems.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <p style={s.sectionLabel}>Mano de obra</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#F97316' }}>
                <th style={{ ...s.th, color: 'white' }}>Descripción del servicio</th>
                <th style={{ ...s.th, color: 'white', textAlign: 'right' as const, width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {values.laborItems.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                  <td style={s.td}>{item.service}</td>
                  <td style={{ ...s.tdRight, fontWeight: '600' }}>{formatCurrency(item.hours * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Refacciones ── */}
      {values.partItems.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <p style={s.sectionLabel}>Refacciones</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#F97316' }}>
                <th style={{ ...s.th, color: 'white' }}>Descripción</th>
                <th style={{ ...s.th, color: 'white', width: '70px' }}>SKU</th>
                <th style={{ ...s.th, color: 'white', textAlign: 'right' as const, width: '50px' }}>Cant.</th>
                <th style={{ ...s.th, color: 'white', textAlign: 'right' as const, width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {values.partItems.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                  <td style={s.td}>{item.name}</td>
                  <td style={{ ...s.td, color: '#94A3B8' }}>{item.sku || '—'}</td>
                  <td style={{ ...s.tdRight }}>{item.quantity}</td>
                  <td style={{ ...s.tdRight, fontWeight: '600' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Totales + Notas side by side ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
        {values.authNotes ? (
          <div style={{ ...s.card, flex: 1, marginBottom: 0 }}>
            <div style={s.cardHeader}><p style={s.sectionLabel}>Notas y condiciones</p></div>
            <div style={s.cardBody}>
              <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.5' }}>{values.authNotes}</p>
            </div>
          </div>
        ) : <div style={{ flex: 1 }} />}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden', minWidth: '240px' }}>
          <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
          {discountAmt > 0 && (
            <TotalRow label={`Descuento (${values.discount}%)`} value={`-${formatCurrency(discountAmt)}`} color="#EF4444" />
          )}
          <TotalRow label="IVA (16%)" value={formatCurrency(tax)} />
          <div style={{ background: '#FFF7ED', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #F97316' }}>
            <span style={{ fontSize: '12px', fontWeight: '700' }}>TOTAL</span>
            <span style={{ fontSize: '15px', fontWeight: '900', color: '#F97316' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* ── Vigencia + firmas ── */}
      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
        <p style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '14px', lineHeight: '1.5' }}>
          Esta cotización tiene una vigencia de <strong>15 días naturales</strong> a partir de la fecha de emisión.
          Los precios indicados incluyen IVA. Sujeto a disponibilidad de refacciones al momento de la aprobación.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          {[
            { title: 'Autorización del cliente', sub: 'Nombre, firma y fecha' },
            { title: 'Firma del asesor', sub: advisor?.name ?? 'Asesor de servicio' },
          ].map(({ title, sub }) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1.5px solid #0F172A', height: '40px', marginBottom: '6px' }} />
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#0F172A', margin: 0 }}>{title}</p>
              <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
