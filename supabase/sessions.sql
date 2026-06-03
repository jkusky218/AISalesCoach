-- ============================================================
-- Sales Craft — Sessions Table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scenario_id uuid references public.scenarios(id) on delete set null,
  scenario_title text not null,
  persona text not null,
  persona_title text not null,
  company text not null,
  messages jsonb not null default '[]',
  feedback jsonb not null default '{}',
  overall_score integer,
  created_at timestamptz default now()
);

alter table public.sessions enable row level security;

-- Users can only see their own sessions
create policy "Users can view their own sessions"
  on public.sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.sessions for delete
  to authenticated
  using (auth.uid() = user_id);
