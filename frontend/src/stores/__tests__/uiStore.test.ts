import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useUIStore.setState({
      sidebarOpen: false,
      sidebarCollapsed: false,
      themeMode: 'light',
      sidebarExpandedGroups: ['dashboard', 'accounting'],
    });
  });

  it('should have correct initial state', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(false);
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.themeMode).toBe('light');
    expect(state.sidebarExpandedGroups).toEqual(['dashboard', 'accounting']);
  });

  it('toggleSidebar should toggle sidebarOpen', () => {
    const { toggleSidebar } = useUIStore.getState();
    
    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    
    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('setSidebarCollapsed should set sidebarCollapsed', () => {
    const { setSidebarCollapsed } = useUIStore.getState();
    
    setSidebarCollapsed(true);
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    
    setSidebarCollapsed(false);
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('toggleTheme should toggle between light and dark', () => {
    const { toggleTheme } = useUIStore.getState();
    
    toggleTheme();
    expect(useUIStore.getState().themeMode).toBe('dark');
    
    toggleTheme();
    expect(useUIStore.getState().themeMode).toBe('light');
  });

  it('setThemeMode should set explicit theme mode', () => {
    const { setThemeMode } = useUIStore.getState();
    
    setThemeMode('dark');
    expect(useUIStore.getState().themeMode).toBe('dark');
    
    setThemeMode('light');
    expect(useUIStore.getState().themeMode).toBe('light');
  });

  it('toggleGroup should add and remove groups', () => {
    const { toggleGroup } = useUIStore.getState();
    
    // Add new group
    toggleGroup('inventory');
    expect(useUIStore.getState().sidebarExpandedGroups).toContain('inventory');
    
    // Remove existing group
    toggleGroup('dashboard');
    expect(useUIStore.getState().sidebarExpandedGroups).not.toContain('dashboard');
  });
});
