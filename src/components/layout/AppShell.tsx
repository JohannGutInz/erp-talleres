import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useUiStore } from '@/stores/ui.store'

export function AppShell() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-secondary">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
