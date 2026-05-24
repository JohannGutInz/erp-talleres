import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
}

interface NotificationsState {
  notifications: Notification[]
  add: (n: Omit<Notification, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  add: (n) => {
    const id = crypto.randomUUID()
    set((s) => ({ notifications: [...s.notifications, { ...n, id }] }))
    setTimeout(() => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
  clear: () => set({ notifications: [] }),
}))
