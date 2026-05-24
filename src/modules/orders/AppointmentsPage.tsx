import { Plus } from 'lucide-react'
import { Calendar } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function AppointmentsPage() {
  return (
    <div>
      <PageHeader
        title="Citas"
        description="Agenda de citas del taller"
        actions={
          <button className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} />
            Nueva Cita
          </button>
        }
      />
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <EmptyState icon={Calendar} message="No hay citas programadas" description="Agenda una cita para un cliente" />
      </div>
    </div>
  )
}
