const SUPABASE_REST_URL = 'https://wwxicktggkobdyuvgilb.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGlja3RnZ2tvYmR5dXZnaWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5Mzc2MzAsImV4cCI6MjEwMDUxMzYzMH0.4SvbnxCXzjwdg9auN_7hVMABCmj8-c5a8mCkZc69MHc';

async function testFetch() {
  console.log('Testing GET businesses with CORRECT key...');
  const res = await fetch(`${SUPABASE_REST_URL}/businesses?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}

testFetch();
