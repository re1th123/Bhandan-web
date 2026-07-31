import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore, DEFAULT_DEMO_BUSINESS } from '../authStore';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(() => Promise.resolve()),
    },
  },
}));

describe('useAuthStore', () => {
  const DEMO_BUSINESS_ID = 'a0000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    // Reset to a known authenticated state before each test
    useAuthStore.setState({
      user: { id: 'demo-user', email: 'demo@bandhan.local' },
      session: { access_token: 'demo-token' } as any,
      activeBusiness: {
        id: DEMO_BUSINESS_ID,
        name: 'Demo Business Inc.',
      } as any,
      businesses: [
        {
          id: DEMO_BUSINESS_ID,
          name: 'Demo Business Inc.',
        } as any,
      ],
      isLoading: false,
      isAuthenticated: true,
    });
  });

  it('should have default state with demo business and authenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.activeBusiness?.id).toBe(DEMO_BUSINESS_ID);
    expect(state.user?.email).toBe('demo@bandhan.local');
  });

  it('setSession should update session, user and isAuthenticated', () => {
    const { setSession } = useAuthStore.getState();

    const mockUser = { id: 'new-user', email: 'new@test.com' };
    const mockSession = { access_token: 'new-token', user: mockUser };

    // setSession takes two args: (session, user)
    setSession(mockSession as any, mockUser as any);

    const state = useAuthStore.getState();
    expect(state.session).toEqual(mockSession);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('setSession with null session should clear authentication', () => {
    const { setSession } = useAuthStore.getState();

    setSession(null, null as any);

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setActiveBusiness should update active business', () => {
    const { setActiveBusiness } = useAuthStore.getState();

    const newBusiness = { id: 'biz-2', name: 'Second Business' } as any;
    setActiveBusiness(newBusiness);

    const state = useAuthStore.getState();
    expect(state.activeBusiness).toEqual(newBusiness);
  });

  it('setBusinesses should update businesses list', () => {
    const { setBusinesses } = useAuthStore.getState();

    const newBusinesses = [{ id: 'biz-3', name: 'Third Business' }] as any[];
    setBusinesses(newBusinesses);

    const state = useAuthStore.getState();
    expect(state.businesses).toEqual(newBusinesses);
  });

  it('setBusinesses should update activeBusiness if current one exists in new list', () => {
    const { setBusinesses } = useAuthStore.getState();

    const updatedBusiness = { id: DEMO_BUSINESS_ID, name: 'Updated Demo' } as any;
    setBusinesses([updatedBusiness]);

    const state = useAuthStore.getState();
    expect(state.activeBusiness).toEqual(updatedBusiness);
  });

  it('setBusinesses should fall back to DEFAULT_DEMO_BUSINESS if current not found', () => {
    const { setBusinesses } = useAuthStore.getState();

    const otherBusinesses = [{ id: 'other-biz', name: 'Other' }] as any[];
    setBusinesses(otherBusinesses);

    const state = useAuthStore.getState();
    // Falls back to DEFAULT_DEMO_BUSINESS when current activeBusiness id not in new list
    expect(state.activeBusiness?.id).toBe(DEFAULT_DEMO_BUSINESS.id);
  });

  it('logout should reset to demo defaults', async () => {
    const { logout } = useAuthStore.getState();

    await logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    // logout resets to DEFAULT_DEMO_BUSINESS, not null
    expect(state.activeBusiness?.id).toBe(DEFAULT_DEMO_BUSINESS.id);
    expect(state.businesses).toHaveLength(1);
    expect(state.businesses[0].id).toBe(DEFAULT_DEMO_BUSINESS.id);
  });
});
