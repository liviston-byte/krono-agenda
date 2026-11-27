import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { AgendaItem, AgendaCategory, ThemeMode, ViewMode } from '@/shared/types/agenda';
import { supabase, fromSupabaseRow, type SupabaseAgendaItemRow } from '@/shared/db/supabaseClient';

interface AppState {
  selectedDate: number;
  viewMode: ViewMode;
  theme: ThemeMode;
  activeReminderId: string | null;
  isFormOpen: boolean;
  editingItemId: string | null;
  isSettingsOpen: boolean;

  user: User | null;
  isAuthInitialized: boolean;
  isAuthModalOpen: boolean;
  isSummaryModalOpen: boolean;
  selectedCategory: AgendaCategory | 'all';

  items: AgendaItem[];
  isLoadingItems: boolean;

  setSelectedDate: (ts: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: ThemeMode) => void;
  openReminderModal: (id: string | null) => void;
  openCreateForm: () => void;
  openEditForm: (id: string) => void;
  closeForm: () => void;
  setSettingsOpen: (open: boolean) => void;

  setUser: (user: User | null) => void;
  setIsAuthInitialized: (val: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setSummaryModalOpen: (open: boolean) => void;
  setSelectedCategory: (category: AgendaCategory | 'all') => void;

  setItems: (items: AgendaItem[]) => void;
  upsertItemInStore: (item: AgendaItem) => void;
  removeItemFromStore: (id: string) => void;
  fetchItemsFromSupabase: () => Promise<void>;
}

const savedTheme = (typeof localStorage !== 'undefined'
  ? (localStorage.getItem('krono-theme') as ThemeMode | null)
  : null) ?? 'system';

export const useAppStore = create<AppState>((set, get) => ({
  selectedDate: Date.now(),
  viewMode: 'day',
  theme: savedTheme,
  activeReminderId: null,
  isFormOpen: false,
  editingItemId: null,
  isSettingsOpen: false,

  user: null,
  isAuthInitialized: false,
  isAuthModalOpen: false,
  isSummaryModalOpen: false,
  selectedCategory: 'all',

  items: [],
  isLoadingItems: false,

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

  setUser: (user) => set({ user }),
  setIsAuthInitialized: (isAuthInitialized) => set({ isAuthInitialized }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  setSummaryModalOpen: (isSummaryModalOpen) => set({ isSummaryModalOpen }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  setItems: (items) => set({ items }),
  upsertItemInStore: (item) => {
    const current = get().items;
    const index = current.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      const next = [...current];
      next[index] = item;
      set({ items: next });
    } else {
      set({ items: [...current, item] });
    }
  },
  removeItemFromStore: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  fetchItemsFromSupabase: async () => {
    if (!supabase) return;
    set({ isLoadingItems: true });
    try {
      const { data, error } = await supabase
        .from('agenda_items')
        .select('*')
        .order('start_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar dados do Supabase:', error.message);
        return;
      }

      if (data) {
        const loaded = (data as SupabaseAgendaItemRow[]).map(fromSupabaseRow);
        set({ items: loaded });
      }
    } catch (err) {
      console.error('Falha de conexão com o Supabase:', err);
    } finally {
      set({ isLoadingItems: false });
    }
  },
}));
