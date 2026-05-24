import { useFormContext } from 'react-hook-form'
import { StickyNote } from 'lucide-react'
import type { VehicleFormValues } from '@/types/vehicle-form.types'
import { VehicleSectionCard } from './VehicleSectionCard'

export function SectionVehicleNotes() {
  const { register, watch } = useFormContext<VehicleFormValues>()
  const notes = watch('notes') ?? ''

  return (
    <VehicleSectionCard icon={StickyNote} title="Notas internas" subtitle="Observaciones visibles solo para el equipo">
      <div className="mt-5">
        <textarea
          {...register('notes')}
          rows={4}
          placeholder="Ej: Cliente muy cuidadoso con su vehículo. Vehículo de flotilla. Requiere autorización corporativa. Garantía pendiente."
          className="w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors resize-none"
        />
        <p className="mt-1.5 text-xs text-text-muted text-right">{notes.length} caracteres</p>
      </div>
    </VehicleSectionCard>
  )
}
