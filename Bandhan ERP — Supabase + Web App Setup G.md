Bandhan ERP — Supabase + Web App Setup Guide
Step-by-step, with exact clicks/navigation

This gets you from zero to: a live Supabase project with your schema and security rules in place, and a working React web app that can log in and read/write data from it. Do the steps in order — later steps depend on earlier ones.

PART 1 — Create the Supabase Project
Step 1.1 — Sign up
Go to supabase.com
Click Start your project (top right)
Sign in with GitHub, or with an email address
You'll land on your Organization page (Supabase creates a default org for you automatically)
Step 1.2 — Create the project
Click New Project
Fill in:
Organization — leave as default, or create one named "Bandhan"
Project name — bandhan-erp
Database Password — generate a strong one and save it somewhere safe (a password manager, not a sticky note — you'll need it again for direct DB connections later, and Supabase does not show it to you again)
Region — choose the one closest to your users (e.g., Mumbai/South Asia region, for lowest latency to India)
Pricing Plan — Free tier is enough to start
Click Create new project
Wait ~2 minutes while Supabase provisions your Postgres database, Auth system, and API — you'll land on the Project Dashboard automatically when it's ready
PART 2 — Build the Database Schema
Step 2.1 — Open the SQL Editor
In the left sidebar of your project dashboard, click SQL Editor (icon looks like </>)
Click New query
Step 2.2 — Run the schema in order

Paste and run each block below one at a time, clicking Run (or Ctrl+Enter) after each, so you can catch errors early rather than debugging one giant paste.

Block 1 — Identity & tenancy tables

sql
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

Note: we're using Supabase's built-in auth.users table instead of a custom users table — Supabase Auth already gives you a managed user identity table, so there's no need to duplicate it. If you later want extra profile fields (full name, phone), add a profiles table with id referencing auth.users(id).

Block 2 — Master data

sql
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

Block 3 — Chart of Accounts & Financial Years (build these before journal entries, since journal entries reference them)

sql
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

Block 4 — Journal entries + the debit=credit trigger

sql
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

The trigger is deferrable initially deferred so it checks balance only at transaction commit — letting you insert multiple lines of one journal entry (which individually don't balance) inside a single transaction, and only rejecting the transaction if the whole entry doesn't net to zero.

Block 5 — Numbering engine

sql
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

Keep going with the remaining tables (stock_ledgers, purchase/sales document chains, payments, bank_accounts, audit_logs, etc.) from the full schema reference doc — same pattern each time: id UUID, business_id UUID references businesses(id), then the table's own fields. Run each create table as its own block so you can spot the exact line if something fails.

PART 3 — Turn on Row-Level Security
Step 3.1 — Enable RLS per table

Still in SQL Editor, run:

sql
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
Step 3.2 — Add policies
sql
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

Repeat this select/insert (and update/delete, as needed) pattern for each table, narrowing the role in (...) list per table's sensitivity — e.g. restrict chart_of_accounts writes to 'Owner' only.

You can verify this in the UI too: left sidebar → Authentication → Policies, or Table Editor → click a table → RLS tab, shows every active policy per table visually.

PART 4 — Set Up Authentication
Step 4.1 — Configure the auth method
Left sidebar → Authentication
Click Providers (sub-tab)
Email is enabled by default — leave it on for now (Dad/Uncle/Accountant can log in with email + password)
Optionally enable Phone if you'd rather your family log in with OTP on their phone number — toggle it on, and you'll need to configure an SMS provider (Twilio, MessageBird) under its settings
Step 4.2 — Create your first users (yourself, to start)
Left sidebar → Authentication → Users tab
Click Add user → Create new user
Enter your email + a password, click Create user