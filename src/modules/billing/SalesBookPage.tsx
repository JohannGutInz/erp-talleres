import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function SalesBookPage() {
  return (
    <div>
      <PageHeader title="Libro de ventas" description="Registro contable de ventas" />
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
        <EmptyState icon={BookOpen} message="No hay registros de ventas" />
      </div>
    </div>
  )
}
