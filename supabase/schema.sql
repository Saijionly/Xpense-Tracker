-- Run this once in your Supabase project's SQL Editor
-- (Dashboard > SQL Editor > New query > paste this > Run)

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  note text,
  date date not null,
  created_at timestamptz not null default now()
);

-- Index to speed up per-user queries
create index if not exists transactions_user_id_idx on public.transactions (user_id);

-- Enable Row Level Security so users can only see their own data
alter table public.transactions enable row level security;

-- Policies: a user can only select/insert/update/delete their own rows
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
