import { Plus } from 'lucide-react'
import { Receipt } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ReceiptsPage() {
  return (
    <div>
      <PageHeader
        title="Recibos"
        description="Recibos de pago generados"
        actions={
          <button className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} />
            Nuevo Recibo
          </button>
        }
      />
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <EmptyState icon={Receipt} message="No hay recibos" description="Los recibos se generan al registrar un pago" />
      </div>
    </div>
  )
}
