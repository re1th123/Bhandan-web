import { supabase } from './supabase';
import type { Business } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface BusinessRegistration {
  business_name: string;
  phone: string;
  gstin?: string;
  email?: string;
}

/** Fetch businesses linked to the authenticated user via business_users. */
export async function fetchUserBusinesses(userId: string): Promise<Business[]> {
  // Step 1: Fetch business_ids for this user from business_users table
  const { data: linkData, error: linkError } = await supabase
    .from('business_users')
    .select('business_id')
    .eq('user_id', userId);

  if (linkError) {
    console.error('Error querying business_users:', linkError.message);
    throw linkError;
  }

  const bizIds = (linkData ?? []).map((row: any) => row.business_id).filter(Boolean);
  if (bizIds.length === 0) {
    return [];
  }

  // Step 2: Fetch business details for those IDs from businesses table
  const { data: bizData, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .in('id', bizIds);

  if (bizError) {
    console.error('Error querying businesses:', bizError.message);
    throw bizError;
  }

  return (bizData as Business[]) ?? [];
}

/** Create a business and link it to the user as owner. Requires an active auth session. */
export async function createBusinessForUser(
  userId: string,
  registration: BusinessRegistration
): Promise<Business> {
  const businessId = crypto.randomUUID();
  const now = new Date().toISOString();

  const businessPayload = {
    id: businessId,
    name: registration.business_name,
    gstin: registration.gstin || null,
    phone: registration.phone || null,
    fy_start_month: 4,
    default_currency: 'INR',
    is_active: true,
  };

  const { data: insertedData, error: businessError } = await supabase
    .from('businesses')
    .insert(businessPayload)
    .select();

  if (businessError) {
    console.error('Failed to insert business record:', businessError.message);
  }

  const business: Business = (insertedData && insertedData[0])
    ? (insertedData[0] as Business)
    : {
        ...businessPayload,
        gstin: registration.gstin || undefined,
        phone: registration.phone || undefined,
        created_at: now,
        updated_at: now,
      };

  const { error: linkError } = await supabase.from('business_users').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    business_id: businessId,
    role: 'owner',
  });

  if (linkError) {
    console.error('Failed to link business to user in business_users:', linkError.message);
  }

  return business;
}

/**
 * Ensure the user has at least one business linked.
 * Creates one from auth metadata or fallback when missing.
 */
export async function ensureUserBusiness(user: User): Promise<Business[]> {
  try {
    const existing = await fetchUserBusinesses(user.id);
    if (existing.length > 0) return existing;

    const meta = user.user_metadata ?? {};
    const businessName =
      (meta.business_name as string | undefined) ||
      (meta.full_name ? `${meta.full_name}'s Enterprise` : undefined) ||
      (user.email ? `${user.email.split('@')[0]}'s Wholesale` : 'My Enterprise');

    const business = await createBusinessForUser(user.id, {
      business_name: businessName,
      phone: (meta.phone as string) || '',
      gstin: (meta.gstin as string) || undefined,
      email: user.email,
    });

    return [business];
  } catch (err: any) {
    console.error('ensureUserBusiness error:', err?.message || err);
    return [];
  }
}
