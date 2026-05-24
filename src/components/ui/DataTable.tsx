import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { PAGINATION_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  globalFilter?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ data, columns, globalFilter, onRowClick }: DataTableProps<T>) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-surface-border bg-white">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-surface-border bg-surface-secondary">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wide whitespace-nowrap"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'border-b border-surface-border last:border-0 hover:bg-surface-secondary/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span>Filas por página</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => setPagination((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))}
            className="border border-surface-border rounded-md px-2 py-1 text-xs bg-white"
          >
            {PAGINATION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn('p-1 rounded border border-surface-border', !table.getCanPreviousPage() && 'opacity-40')}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn('p-1 rounded border border-surface-border', !table.getCanNextPage() && 'opacity-40')}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
