-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  note text default '',
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);

alter table public.transactions enable row level security;

-- Users can only see their own transactions
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Users can only insert transactions for themselves
create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- Users can only delete their own transactions
create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Users can only update their own transactions
create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);
