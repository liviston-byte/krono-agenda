import { create } from 'zustand';
import type { ThemeMode, ViewMode } from '@/shared/types/agenda';

interface AppState {
  selectedDate: number;
  viewMode: ViewMode;
  theme: ThemeMode;
  activeReminderId: string | null;
  isFormOpen: boolean;
  editingItemId: string | null;
  isSettingsOpen: boolean;

  setSelectedDate: (ts: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: ThemeMode) => void;
  openReminderModal: (id: string | null) => void;
  openCreateForm: () => void;
  openEditForm: (id: string) => void;
  closeForm: () => void;
  setSettingsOpen: (open: boolean) => void;
}

const savedTheme = (typeof localStorage !== 'undefined'
  ? (localStorage.getItem('krono-theme') as ThemeMode | null)
  : null) ?? 'system';

export const useAppStore = create<AppState>((set) => ({
  selectedDate: Date.now(),
  viewMode: 'day',
  theme: savedTheme,
  activeReminderId: null,
  isFormOpen: false,
  editingItemId: null,
  isSettingsOpen: false,

  setSelectedDate: (ts) => set({ selectedDate: ts }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('krono-theme', theme);
    }
    set({ theme });
  },
  openReminderModal: (id) => set({ activeReminderId: id }),
  openCreateForm: () => set({ isFormOpen: true, editingItemId: null }),
  openEditForm: (id) => set({ isFormOpen: true, editingItemId: id }),
  closeForm: () => set({ isFormOpen: false, editingItemId: null }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
}));
