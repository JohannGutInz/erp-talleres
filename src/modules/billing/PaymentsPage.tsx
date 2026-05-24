import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Pagos" description="Registro de pagos recibidos" />
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <EmptyState icon={CreditCard} message="No hay pagos registrados" />
      </div>
    </div>
  )
}
