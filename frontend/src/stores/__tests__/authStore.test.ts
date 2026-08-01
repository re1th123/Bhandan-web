import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(() => Promise.resolve()),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Mock businessService
vi.mock('../../lib/businessService', () => ({
  fetchUserBusinesses: vi.fn(() => Promise.resolve([])),
  ensureUserBusiness: vi.fn(() => Promise.resolve([])),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset to unauthenticated state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      activeBusiness: null,
      businesses: [],
      isLoading: false,
      isAuthenticated: false,
    });
  });

  it('should start with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.activeBusiness).toBeNull();
    expect(state.businesses).toEqual([]);
  });

  it('setSession should update session, user and isAuthenticated', () => {
    const { setSession } = useAuthStore.getState();

    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { access_token: 'real-token', user: mockUser };

    setSession(mockSession as any, mockUser as any);

    const state = useAuthStore.getState();
    expect(state.session).toEqual(mockSession);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('setSession with null session should clear authentication', () => {
    const { setSession } = useAuthStore.getState();

    // First authenticate
    setSession({ access_token: 'tk' } as any, { id: 'u1', email: 'a@b.com' } as any);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Then clear
    setSession(null, null as any);

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setActiveBusiness should update active business', () => {
    const { setActiveBusiness } = useAuthStore.getState();

    const newBusiness = { id: 'biz-2', name: 'Real Business' } as any;
    setActiveBusiness(newBusiness);

    const state = useAuthStore.getState();
    expect(state.activeBusiness).toEqual(newBusiness);
  });

  it('setBusinesses should update businesses list and pick first as active', () => {
    const { setBusinesses } = useAuthStore.getState();

    const newBusinesses = [{ id: 'biz-3', name: 'Third Business' }] as any[];
    setBusinesses(newBusinesses);

    const state = useAuthStore.getState();
    expect(state.businesses).toEqual(newBusinesses);
    expect(state.activeBusiness).toEqual(newBusinesses[0]);
  });

  it('setBusinesses should retain current activeBusiness if still in list', () => {
    const { setActiveBusiness, setBusinesses } = useAuthStore.getState();

    const biz = { id: 'biz-A', name: 'Business A' } as any;
    setActiveBusiness(biz);

    const updatedBiz = { id: 'biz-A', name: 'Updated A' } as any;
    setBusinesses([updatedBiz, { id: 'biz-B', name: 'B' } as any]);

    const state = useAuthStore.getState();
    expect(state.activeBusiness?.id).toBe('biz-A');
    expect(state.activeBusiness?.name).toBe('Updated A');
  });

  it('setBusinesses should fall back to first business if current not found', () => {
    const { setActiveBusiness, setBusinesses } = useAuthStore.getState();

    setActiveBusiness({ id: 'old-biz', name: 'Old' } as any);

    const otherBusinesses = [{ id: 'other-biz', name: 'Other' }] as any[];
    setBusinesses(otherBusinesses);

    const state = useAuthStore.getState();
    expect(state.activeBusiness?.id).toBe('other-biz');
  });

  it('logout should reset to unauthenticated state', async () => {
    const { setSession, logout } = useAuthStore.getState();

    // Authenticate first
    setSession({ access_token: 'tk' } as any, { id: 'u1', email: 'a@b.com' } as any);

    await logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.activeBusiness).toBeNull();
    expect(state.businesses).toEqual([]);
  });
});
