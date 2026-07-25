# Bandhan ERP — Supabase + Web App Setup Guide
### Step-by-step, with exact clicks/navigation

This gets you from zero to: a live Supabase project with your schema and security rules in place, and a working React web app that can log in and read/write data from it. Do the steps in order — later steps depend on earlier ones.

---

## PART 1 — Create the Supabase Project

### Step 1.1 — Sign up
1. Go to **supabase.com**
2. Click **Start your project** (top right)
3. Sign in with GitHub, or with an email address
4. You'll land on your **Organization** page (Supabase creates a default org for you automatically)

### Step 1.2 — Create the project
1. Click **New Project**
2. Fill in:
   - **Organization** — leave as default, or create one named "Bandhan"
   - **Project name** — `bandhan-erp`
   - **Database Password** — generate a strong one and **save it somewhere safe** (a password manager, not a sticky note — you'll need it again for direct DB connections later, and Supabase does not show it to you again)
   - **Region** — choose the one closest to your users (e.g., Mumbai/South Asia region, for lowest latency to India)
   - **Pricing Plan** — Free tier is enough to start
3. Click **Create new project**
4. Wait ~2 minutes while Supabase provisions your Postgres database, Auth system, and API — you'll land on the **Project Dashboard** automatically when it's ready

---

## PART 2 — Build the Database Schema

### Step 2.1 — Open the SQL Editor
1. In the left sidebar of your project dashboard, click **SQL Editor** (icon looks like `</>`)
2. Click **New query**

### Step 2.2 — Run the schema in order
Paste and run each block below **one at a time**, clicking **Run** (or `Ctrl+Enter`) after each, so you can catch errors early rather than debugging one giant paste.

**Block 1 — Identity & tenancy tables**
```sql
create table businesses (
    id UUID primary key default gen_random_uuid(),
    name TEXT not null,
    gstin TEXT,
    pan TEXT,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    fy_start_month INT not null default 4,
    default_currency TEXT not null default 'INR',
    is_active BOOLEAN not null default true,
    created_at TIMESTAMPTZ not null default now(),
    updated_at TIMESTAMPTZ not null default now()
);

create table business_users (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    user_id UUID not null references auth.users(id),
    role TEXT not null check (role in ('Owner','Accountant','Employee')),
    owner_label TEXT,
    is_active BOOLEAN not null default true,
    invited_at TIMESTAMPTZ not null default now(),
    joined_at TIMESTAMPTZ,
    unique (business_id, user_id)
);
```
> Note: we're using Supabase's built-in `auth.users` table instead of a custom `users` table — Supabase Auth already gives you a managed user identity table, so there's no need to duplicate it. If you later want extra profile fields (full name, phone), add a `profiles` table with `id` referencing `auth.users(id)`.

**Block 2 — Master data**
```sql
create table customers (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    name TEXT not null,
    gstin TEXT, address TEXT, phone TEXT,
    credit_limit NUMERIC, payment_terms TEXT, category TEXT,
    is_active BOOLEAN not null default true,
    created_by UUID references auth.users(id),
    created_at TIMESTAMPTZ not null default now(),
    updated_at TIMESTAMPTZ not null default now(),
    version INT not null default 1
);

create table suppliers (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    name TEXT not null,
    gstin TEXT, pan TEXT, address TEXT, phone TEXT,
    payment_terms TEXT, category TEXT,
    is_active BOOLEAN not null default true,
    created_by UUID references auth.users(id),
    created_at TIMESTAMPTZ not null default now(),
    updated_at TIMESTAMPTZ not null default now(),
    version INT not null default 1
);

create table warehouses (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    name TEXT not null, location TEXT, capacity NUMERIC,
    is_active BOOLEAN not null default true,
    created_at TIMESTAMPTZ not null default now(),
    updated_at TIMESTAMPTZ not null default now()
);

create table products (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    name TEXT not null, sku TEXT not null,
    hsn_code TEXT, category TEXT,
    wholesale_price NUMERIC, price NUMERIC, cost_price NUMERIC,
    min_stock_alert INT default 0,
    warehouse_id UUID references warehouses(id),
    is_active BOOLEAN not null default true,
    created_at TIMESTAMPTZ not null default now(),
    updated_at TIMESTAMPTZ not null default now(),
    unique (business_id, sku)
);
```

**Block 3 — Chart of Accounts & Financial Years** *(build these before journal entries, since journal entries reference them)*
```sql
create table financial_years (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    name TEXT not null,
    start_date DATE not null, end_date DATE not null,
    is_current BOOLEAN not null default false,
    is_closed BOOLEAN not null default false,
    is_locked BOOLEAN not null default false
);

create table chart_of_accounts (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    code TEXT not null,
    name TEXT not null,
    category TEXT not null check (category in ('Asset','Liability','Equity','Revenue','Expense')),
    account_type TEXT not null,
    parent_account_id UUID references chart_of_accounts(id),
    is_active BOOLEAN not null default true,
    created_at TIMESTAMPTZ not null default now(),
    unique (business_id, code)
);
```

**Block 4 — Journal entries + the debit=credit trigger**
```sql
create table journal_entries (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    journal_number TEXT not null,
    entry_date DATE not null,
    voucher_type TEXT not null check (voucher_type in ('Receipt','Payment','Journal','Purchase','Sales')),
    reference_module TEXT,
    reference_document_id UUID,
    narration TEXT,
    financial_year_id UUID not null references financial_years(id),
    created_by UUID references auth.users(id),
    created_at TIMESTAMPTZ not null default now(),
    unique (business_id, journal_number)
);

create table journal_entry_lines (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    journal_id UUID not null references journal_entries(id) on delete cascade,
    account_id UUID not null references chart_of_accounts(id),
    debit_amount NUMERIC(14,2) not null default 0,
    credit_amount NUMERIC(14,2) not null default 0,
    description TEXT,
    check (debit_amount = 0 or credit_amount = 0)
);

-- Enforce debit = credit at the database level, per journal entry
create or replace function check_journal_balance() returns trigger as $$
declare
  v_diff numeric;
begin
  select coalesce(sum(debit_amount),0) - coalesce(sum(credit_amount),0)
  into v_diff
  from journal_entry_lines
  where journal_id = coalesce(new.journal_id, old.journal_id);

  if v_diff != 0 then
    raise exception 'Journal entry % is unbalanced by %', coalesce(new.journal_id, old.journal_id), v_diff;
  end if;
  return null;
end;
$$ language plpgsql;

create constraint trigger trg_journal_balance
  after insert or update or delete on journal_entry_lines
  deferrable initially deferred
  for each row execute function check_journal_balance();
```
> The trigger is `deferrable initially deferred` so it checks balance only at transaction commit — letting you insert multiple lines of one journal entry (which individually don't balance) inside a single transaction, and only rejecting the transaction if the *whole entry* doesn't net to zero.

**Block 5 — Numbering engine**
```sql
create table numbering_sequences (
    id UUID primary key default gen_random_uuid(),
    business_id UUID not null references businesses(id),
    document_type TEXT not null,
    financial_year_id UUID not null references financial_years(id),
    prefix TEXT not null default '',
    current_number BIGINT not null default 0,
    unique (business_id, document_type, financial_year_id)
);

create or replace function next_document_number(p_business_id UUID, p_doc_type TEXT, p_fy_id UUID)
returns TEXT as $$
declare v_num BIGINT; v_prefix TEXT;
begin
  update numbering_sequences
     set current_number = current_number + 1
   where business_id = p_business_id and document_type = p_doc_type and financial_year_id = p_fy_id
   returning current_number, prefix into v_num, v_prefix;

  if not found then
    raise exception 'No numbering_sequences row for business %, type %, FY %', p_business_id, p_doc_type, p_fy_id;
  end if;

  return v_prefix || v_num::text;
end;
$$ language plpgsql;
```

> Keep going with the remaining tables (stock_ledgers, purchase/sales document chains, payments, bank_accounts, audit_logs, etc.) from the full schema reference doc — same pattern each time: `id UUID`, `business_id UUID references businesses(id)`, then the table's own fields. Run each `create table` as its own block so you can spot the exact line if something fails.

---

## PART 3 — Turn on Row-Level Security

### Step 3.1 — Enable RLS per table
Still in **SQL Editor**, run:
```sql
alter table businesses enable row level security;
alter table business_users enable row level security;
alter table customers enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table warehouses enable row level security;
alter table chart_of_accounts enable row level security;
alter table financial_years enable row level security;
alter table journal_entries enable row level security;
alter table journal_entry_lines enable row level security;
-- repeat for every table you created
```

### Step 3.2 — Add policies
```sql
-- Business membership check, reused by every policy below
create policy "members can view their businesses"
on businesses for select
using (
  id in (select business_id from business_users where user_id = auth.uid() and is_active = true)
);

create policy "members can view customers"
on customers for select
using (
  business_id in (select business_id from business_users where user_id = auth.uid() and is_active = true)
);

create policy "owners and accountants can write customers"
on customers for insert
with check (
  business_id in (
    select business_id from business_users
    where user_id = auth.uid() and is_active = true and role in ('Owner','Accountant')
  )
);
```
Repeat this select/insert (and update/delete, as needed) pattern for each table, narrowing the `role in (...)` list per table's sensitivity — e.g. restrict `chart_of_accounts` writes to `'Owner'` only.

**You can verify this in the UI too:** left sidebar → **Authentication** → **Policies**, or **Table Editor** → click a table → **RLS** tab, shows every active policy per table visually.

---

## PART 4 — Set Up Authentication

### Step 4.1 — Configure the auth method
1. Left sidebar → **Authentication**
2. Click **Providers** (sub-tab)
3. **Email** is enabled by default — leave it on for now (Dad/Uncle/Accountant can log in with email + password)
4. Optionally enable **Phone** if you'd rather your family log in with OTP on their phone number — toggle it on, and you'll need to configure an SMS provider (Twilio, MessageBird) under its settings

### Step 4.2 — Create your first users (yourself, to start)
1. Left sidebar → **Authentication** → **Users** tab
2. Click **Add user** → **Create new user**
3. Enter your email + a password, click **Create user**
4. Repeat for Dad, Uncle, Accountant (or let them self-signup later from the web app once it's built)

### Step 4.3 — Link each user to the business
Back in **SQL Editor**, insert the business and membership rows:
```sql
insert into businesses (name, gstin) values ('Your Business Name', 'YOUR_GSTIN')
returning id;
-- copy the returned id, use it below

insert into business_users (business_id, user_id, role, owner_label)
values (
  'PASTE_BUSINESS_ID_HERE',
  'PASTE_USER_ID_FROM_AUTH_USERS_TAB',
  'Owner',
  'Dad'
);
```
> Find each user's `id` in **Authentication → Users** — click a user row to see their UUID, or select it directly: `select id, email from auth.users;`

---

## PART 5 — Get Your API Credentials

1. Left sidebar → **Project Settings** (gear icon, bottom of sidebar)
2. Click **API**
3. Note down two values, you'll need them in the web app next:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under **Project API keys**) — this is safe to use in browser-side code, since RLS enforces access control, not the key itself
4. Do **not** use the **service_role** key anywhere in your web app's frontend code — that key bypasses RLS entirely and should only ever live in a trusted server environment, never shipped to a browser.

---

## PART 6 — Build the Web App (React + Vite)

### Step 6.1 — Scaffold the project (run in your terminal, not the browser)
```bash
npm create vite@latest bandhan-web -- --template react-ts
cd bandhan-web
npm install
```

### Step 6.2 — Install the Supabase client
```bash
npm install @supabase/supabase-js
```

### Step 6.3 — Store your credentials safely
1. In the project root, create a file named `.env.local`
2. Add:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
3. Create/edit `.gitignore` in the project root and make sure it includes:
```
.env.local
```
so your keys never get committed to GitHub.

### Step 6.4 — Create the Supabase client
Create `src/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 6.5 — Build a basic login screen
Create `src/Login.tsx`:
```tsx
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Bandhan — Sign In</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Sign In</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
```

### Step 6.6 — Test that data comes through
In `src/App.tsx`, once logged in, try a read query to confirm RLS + auth are wired correctly:
```tsx
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase.from('customers').select('*')
      if (error) console.error(error)
      else setCustomers(data)
    }
    fetchCustomers()
  }, [])

  return (
    <ul>
      {customers.map(c => <li key={c.id}>{c.name}</li>)}
    </ul>
  )
}

export default App
```
Run it:
```bash
npm run dev
```
Open the local URL shown in the terminal (usually `http://localhost:5173`). Log in with the user you created in Part 4 — if RLS and the `business_users` link are set up correctly, you'll see the customer(s) belonging to their business; if you see an empty list even though rows exist in the table, double-check the `business_users` row links that `auth.uid()` to the right `business_id`.

---

## PART 7 — Deploy the Web App

### Step 7.1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial Bandhan web app"
```
Create a new repository on **github.com** (top right → **+** → **New repository**), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/bandhan-web.git
git push -u origin main
```

### Step 7.2 — Deploy on Vercel (fastest path for a Vite/React app)
1. Go to **vercel.com** → sign in with GitHub
2. Click **Add New...** → **Project**
3. Select your `bandhan-web` repository → click **Import**
4. Under **Environment Variables**, add the same two values from your `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**
6. After ~1 minute, Vercel gives you a live URL (e.g., `bandhan-web.vercel.app`) — this is now your online web app, backed by the same Supabase database the Android app will eventually connect to.

---

## What's next after this

- Finish creating the remaining tables from the full schema (stock ledgers, purchase/sales document chains, payments, bank accounts, audit logs) using the same block-by-block pattern in Part 2.
- Build out real screens (Dashboard, Customer List, Invoice creation) instead of the placeholder list.
- Point the Android app at the same Supabase project (same URL/anon key, via the Kotlin Supabase client) so both apps share this one backend.
- Once real business data is in play, test the `next_document_number()` function and the debit=credit trigger deliberately — create two invoices back to back and confirm no number collisions, and try inserting an unbalanced journal entry and confirm it's rejected.
