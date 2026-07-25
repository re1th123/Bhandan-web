const SUPABASE_REST_URL = 'https://wwxicktggkobdyuvgilb.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGlja3RnZ2tvYmR5dXZnaWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5Mzc2MzAsImV4cCI6MjEwMDUxMzYzMH0.4SvbnxCXzjwdg9auN_7hVMABCmj8-c5a8mCkZc69MHc';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

async function countTable(table) {
  const res = await fetch(`${SUPABASE_REST_URL}/${table}?select=count`, {
    headers: { ...headers, 'Prefer': 'count=exact' }
  });
  const countHeader = res.headers.get('content-range');
  console.log(`Table '${table}' Status:`, res.status, 'Content-Range:', countHeader);
  if (res.ok) {
    const data = await res.json();
    console.log(`Table '${table}' Data:`, data);
  }
}

async function run() {
  console.log('--- Checking Supabase Live Row Counts ---');
  await countTable('businesses');
  await countTable('customers');
  await countTable('suppliers');
  await countTable('products');
  await countTable('warehouses');
}

run();
