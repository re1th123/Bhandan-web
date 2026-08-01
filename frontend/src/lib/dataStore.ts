import { DEFAULT_DEMO_BUSINESS } from '../stores/authStore';
import supabase from './supabase';

export const isDemoBusiness = (bizId?: string | null): boolean => {
  if (!bizId) return true;
  return bizId === DEFAULT_DEMO_BUSINESS.id;
};

/**
 * Universal Data Fetcher
 * - Demo Mode: returns mockData (+ any local demo additions)
 * - Real Account Mode: returns real Supabase records for bizId (+ local real additions).
 *   Returns empty array [] if brand new account with 0 records.
 */
export async function fetchBusinessTableData<T>(
  bizId: string | undefined | null,
  tableName: string,
  mockData: T[]
): Promise<T[]> {
  if (isDemoBusiness(bizId)) {
    const key = `demo_${tableName}`;
    const localDemo = localStorage.getItem(key);
    if (localDemo) {
      try {
        const added: T[] = JSON.parse(localDemo);
        return [...added, ...mockData];
      } catch (e) {
        return mockData;
      }
    }
    return mockData;
  }

  // Real Account Mode:
  const key = `real_${bizId}_${tableName}`;
  let localItems: T[] = [];
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      localItems = JSON.parse(stored);
    } catch (e) {
      localItems = [];
    }
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('business_id', bizId);

    if (!error && data) {
      // Deduplicate remote data with local items
      const remoteIds = new Set(data.map((d: any) => d.id));
      const filteredLocal = localItems.filter((item: any) => !remoteIds.has(item.id));
      return [...filteredLocal, ...(data as T[])];
    }
  } catch (err) {
    console.warn(`Supabase query warning for ${tableName}:`, err);
  }

  return localItems;
}

/**
 * Universal Data Inserter
 * - Demo Mode: stores in `demo_${tableName}`
 * - Real Account Mode: inserts to Supabase + stores in `real_${bizId}_${tableName}`
 */
export async function insertBusinessTableData<T extends Record<string, any>>(
  bizId: string | undefined | null,
  tableName: string,
  newItem: T
): Promise<T> {
  const currentBizId = bizId || DEFAULT_DEMO_BUSINESS.id;
  const itemWithMeta: T = {
    ...newItem,
    id: newItem.id || `${tableName.slice(0, 4)}_${Date.now()}`,
    business_id: currentBizId,
    created_at: newItem.created_at || new Date().toISOString(),
  };

  if (isDemoBusiness(bizId)) {
    const key = `demo_${tableName}`;
    const stored = localStorage.getItem(key);
    const list: T[] = stored ? JSON.parse(stored) : [];
    const updated = [itemWithMeta, ...list];
    localStorage.setItem(key, JSON.stringify(updated));
    return itemWithMeta;
  }

  // Real Account Mode
  const key = `real_${bizId}_${tableName}`;
  const stored = localStorage.getItem(key);
  const list: T[] = stored ? JSON.parse(stored) : [];
  const updated = [itemWithMeta, ...list];
  localStorage.setItem(key, JSON.stringify(updated));

  // Async push to Supabase
  try {
    await supabase.from(tableName).insert([itemWithMeta]);
  } catch (err) {
    console.warn(`Cloud insert for ${tableName} queued locally:`, err);
  }

  return itemWithMeta;
}
