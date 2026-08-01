import supabase from './supabase';

/** Fetch rows for a business from Supabase. */
export async function fetchBusinessTableData<T>(
  bizId: string | undefined | null,
  tableName: string
): Promise<T[]> {
  if (!bizId) return [];

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('business_id', bizId);

  if (error) {
    console.error(`Supabase fetch failed for ${tableName}:`, error.message);
    throw error;
  }

  return (data as T[]) ?? [];
}

/** Insert a row into a business-scoped Supabase table. */
export async function insertBusinessTableData<T extends Record<string, unknown>>(
  bizId: string | undefined | null,
  tableName: string,
  newItem: T
): Promise<T> {
  if (!bizId) {
    throw new Error('No active business. Sign in and complete registration first.');
  }

  const { id: _id, business_id: _biz, created_at: _created, ...rest } = newItem as T & {
    id?: string;
    business_id?: string;
    created_at?: string;
  };

  const { data, error } = await supabase
    .from(tableName)
    .insert({ ...rest, business_id: bizId })
    .select()
    .single();

  if (error) {
    console.error(`Supabase insert failed for ${tableName}:`, error.message);
    throw error;
  }

  return data as T;
}
