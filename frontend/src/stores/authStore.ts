import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Business } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
}

export const DEFAULT_DEMO_BUSINESS: Business = {
  id: 'a0000000-0000-4000-8000-000000000001',
  name: 'Bandhan Wholesale Ltd',
  gstin: '27AABCB1234D1ZB',
  pan: 'AABCB1234D',
  address: 'Plot 42, Industrial Wholesale Market, Sector 18, Mumbai, MH',
  phone: '+91 98765 43210',
  logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
  fy_start_month: 4,
  default_currency: 'INR',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

interface AuthState {
  user: AuthUser | null;
  session: any | null;
  activeBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  isAuthenticated: boolean;

  setSession: (session: any, user: AuthUser) => void;
  setActiveBusiness: (business: Business) => void;
  setBusinesses: (businesses: Business[]) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'u0000000-0000-4000-8000-000000000001',
        email: 'owner@bandhanwholesale.com',
        full_name: 'Bandhan Admin',
      },
      session: null,
      activeBusiness: DEFAULT_DEMO_BUSINESS,
      businesses: [DEFAULT_DEMO_BUSINESS],
      isLoading: false,
      isAuthenticated: true,

      setSession: (session, user) =>
        set({ session, user, isAuthenticated: !!session, isLoading: false }),

      setActiveBusiness: (business) =>
        set({ activeBusiness: business }),

      setBusinesses: (businesses) => {
        const current = get().activeBusiness;
        const active = current ? businesses.find((b) => b.id === current.id) : businesses[0];
        set({ businesses, activeBusiness: active || DEFAULT_DEMO_BUSINESS });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          activeBusiness: DEFAULT_DEMO_BUSINESS,
          businesses: [DEFAULT_DEMO_BUSINESS],
        });
      },

      initialize: async () => {
        set({ isLoading: true });
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          set({
            session: data.session,
            user: {
              id: data.session.user.id,
              email: data.session.user.email ?? '',
              full_name: data.session.user.user_metadata?.full_name,
            },
            isAuthenticated: true,
          });

          // Attempt to fetch user's registered businesses from Supabase
          try {
            const { data: bData } = await supabase
              .from('businesses')
              .select('*');
            if (bData && bData.length > 0) {
              set({ businesses: bData, activeBusiness: bData[0] });
            }
          } catch (e) {
            console.warn('Could not fetch cloud businesses, using default demo business.', e);
          }
        }
        set({ isLoading: false });

        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            set({
              session,
              user: {
                id: session.user.id,
                email: session.user.email ?? '',
                full_name: session.user.user_metadata?.full_name,
              },
              isAuthenticated: true,
            });
          }
        });
      },
    }),
    {
      name: 'bandhan-auth',
      partialize: (state) => ({
        activeBusiness: state.activeBusiness,
        businesses: state.businesses,
      }),
    }
  )
);

export default useAuthStore;
