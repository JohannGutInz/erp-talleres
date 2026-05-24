import { BadgeDollarSign } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

// comisiones por técnico y periodo, con filtros por fecha, técnico y estado de la orden de trabajo. Mostrar total de comisiones y desglose por orden de trabajo 

export default function CommissionsPage() {
  return (
    <div>
      <PageHeader title="Comisiones" description="Comisiones por técnico y periodo" />
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <EmptyState icon={BadgeDollarSign} message="No hay comisiones calculadas" />
      </div>
    </div>
  )
}
