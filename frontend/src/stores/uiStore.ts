import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  themeMode: 'light' | 'dark';
  sidebarExpandedGroups: string[];

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleTheme: () => void;
  toggleGroup: (group: string) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      themeMode: 'light',
      sidebarExpandedGroups: ['Sales', 'Purchases', 'Inventory', 'Finance', 'Reports'],

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleTheme: () =>
        set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleGroup: (group) =>
        set((s) => ({
          sidebarExpandedGroups: s.sidebarExpandedGroups.includes(group)
            ? s.sidebarExpandedGroups.filter((g) => g !== group)
            : [...s.sidebarExpandedGroups, group],
        })),
    }),
    { name: 'bandhan-ui' }
  )
);
