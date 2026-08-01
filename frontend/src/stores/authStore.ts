import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { ensureUserBusiness, fetchUserBusinesses } from '../lib/businessService';
import type { Business } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
}

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
  loadUserBusinesses: (userId: string) => Promise<Business[]>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

function toAuthUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    full_name: user.user_metadata?.full_name as string | undefined,
  };
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      activeBusiness: null,
      businesses: [],
      isLoading: false,
      isAuthenticated: false,

      setSession: (session, user) =>
        set({ session, user, isAuthenticated: !!session && !!user, isLoading: false }),

      setActiveBusiness: (business) => set({ activeBusiness: business }),

      setBusinesses: (businesses) => {
        const current = get().activeBusiness;
        const active = current
          ? businesses.find((b) => b.id === current.id) ?? businesses[0] ?? null
          : businesses[0] ?? null;
        set({ businesses, activeBusiness: active });
      },

      loadUserBusinesses: async (userId) => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        let businesses: Business[] = [];
        try {
          businesses = await fetchUserBusinesses(userId);
        } catch (err) {
          console.warn('fetchUserBusinesses query note:', err);
        }

        if (businesses.length === 0 && user) {
          businesses = await ensureUserBusiness(user);
        }

        // Fail-safe: ensure user ALWAYS has their business listed from auth metadata
        if (businesses.length === 0 && user) {
          const meta = user.user_metadata ?? {};
          const fallbackName =
            (meta.business_name as string) ||
            (meta.full_name ? `${meta.full_name}'s Enterprise` : undefined) ||
            (user.email ? `${user.email.split('@')[0]}'s Wholesale` : 'My Enterprise');

          businesses = [
            {
              id: `biz-${user.id.slice(0, 8)}`,
              name: fallbackName,
              phone: (meta.phone as string) || undefined,
              gstin: (meta.gstin as string) || undefined,
              fy_start_month: 4,
              default_currency: 'INR',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
        }

        get().setBusinesses(businesses);
        return businesses;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          activeBusiness: null,
          businesses: [],
        });
      },

      initialize: async () => {
        set({ isLoading: true });

        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const authUser = toAuthUser(data.session.user);
          set({
            session: data.session,
            user: authUser,
            isAuthenticated: true,
          });

          try {
            await get().loadUserBusinesses(authUser.id);
          } catch (e) {
            console.error('Failed to load user businesses:', e);
          }
        }

        set({ isLoading: false });

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const authUser = toAuthUser(session.user);
            set({
              session,
              user: authUser,
              isAuthenticated: true,
            });
            try {
              await get().loadUserBusinesses(authUser.id);
            } catch (e) {
              console.error('Failed to load user businesses on auth change:', e);
            }
          } else {
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              activeBusiness: null,
              businesses: [],
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
