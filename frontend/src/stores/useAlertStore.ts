import { create } from 'zustand';
import type { Alert } from '@/types/app.types';

interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  setAlerts: (alerts: Alert[]) => void;
  acknowledge: (alertId: string) => void;
  dismiss: (alertId: string) => void;
  updateUnreadCount: (count: number) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => !a.acknowledged_at).length,
    }),

  acknowledge: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged_at: new Date().toISOString() } : alert
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  dismiss: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== alertId),
    })),

  updateUnreadCount: (count) =>
    set({
      unreadCount: count,
    }),
}));
