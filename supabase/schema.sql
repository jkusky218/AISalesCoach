-- ============================================================
-- Sales Craft — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Scenarios
create table if not exists public.scenarios (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  vertical text not null,
  product text not null,
  persona text not null,
  persona_title text not null,
  company text not null,
  company_desc text not null,
  difficulty text not null check (difficulty in ('Intermediate', 'Advanced')),
  setup text not null,
  objectives jsonb not null default '[]',
  persona_prompt text not null,
  voice_id text not null,
  is_builtin boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.scenarios enable row level security;

-- All authenticated users can read scenarios
create policy "Authenticated users can view scenarios"
  on public.scenarios for select
  to authenticated
  using (true);

-- Authenticated users can insert scenarios
create policy "Authenticated users can create scenarios"
  on public.scenarios for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Authenticated users can update non-builtin scenarios
create policy "Authenticated users can update custom scenarios"
  on public.scenarios for update
  to authenticated
  using (is_builtin = false);

-- Authenticated users can delete non-builtin scenarios
create policy "Authenticated users can delete custom scenarios"
  on public.scenarios for delete
  to authenticated
  using (is_builtin = false);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_scenario_updated
  before update on public.scenarios
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Seed: 4 built-in scenarios
-- ============================================================

insert into public.scenarios (title, vertical, product, persona, persona_title, company, company_desc, difficulty, setup, objectives, persona_prompt, voice_id, is_builtin) values
(
  'Cold Discovery: Global Logistics VP',
  'Transportation & Logistics',
  'Customer Service Management',
  'Jennifer Huang',
  'VP of Customer Experience',
  'Meridian Freight Corp',
  '$6B global freight forwarder, 15,000 employees, 200+ distribution centers',
  'Intermediate',
  'You''re 10 minutes into a first discovery call. The prospect agreed to the meeting because they''re drowning in customer complaints about shipment visibility. They currently use Salesforce Service Cloud and a custom-built tracking portal. The VP is skeptical — she''s been burned by platform vendors before.',
  '["Uncover 2-3 specific pain points tied to their current stack", "Connect pain to CSM capabilities without pitching features", "Earn a follow-up meeting with her and the CIO"]',
  'You are Jennifer Huang, VP of Customer Experience at Meridian Freight Corp, a $6B global freight forwarder.

YOUR SITUATION:
- Your team handles 40,000+ customer inquiries/month across phone, email, and a clunky self-service portal
- Salesforce Service Cloud is your current CRM but it''s siloed from operations — agents can''t see real-time shipment status
- You built a custom tracking portal 3 years ago but it''s brittle, expensive to maintain, and doesn''t integrate with your TMS
- Customer satisfaction (CSAT) dropped from 78 to 64 over the past year
- CEO is breathing down your neck about retention — lost two top-10 accounts last quarter
- Skeptical of "platform plays" — been sold big promises before

YOUR PERSONALITY:
- Direct, data-driven, no patience for buzzwords
- Push back on vague claims — ask for specifics and proof points
- Warm up if the SA shows genuine understanding of logistics complexity
- Secretly interested in AI-powered case routing but won''t bring it up unless the SA earns trust
- If the SA mentions "digital transformation" or "single pane of glass" you get visibly annoyed',
  '21m00Tcm4TlvDq8ikWAM',
  true
),
(
  'Security Objection: Armis & Veza Play',
  'Transportation & Logistics',
  'Security Ops + Armis + Veza',
  'David Kowalski',
  'CISO',
  'Pacific Intermodal',
  '$3.2B intermodal shipping, 8,000 employees, heavy OT/IoT environment',
  'Advanced',
  'You''re in a competitive deal against Palo Alto XSOAR and CrowdStrike. The CISO had a bad experience with ServiceNow SecOps 2 years ago and thinks it''s "just a ticketing system." You need to reposition with the Armis and Veza acquisitions.',
  '["Reframe ServiceNow Security beyond ticketing", "Position Armis asset discovery for OT/IoT", "Introduce Veza identity security for AI agent governance", "Neutralize Palo Alto and CrowdStrike threat"]',
  'You are David Kowalski, CISO of Pacific Intermodal, a $3.2B intermodal shipping company.

YOUR SITUATION:
- 50,000+ OT/IoT devices across ports, rail yards, distribution centers — most unmanaged
- Evaluated ServiceNow SecOps 2 years ago and rejected it as "just a ticketing system"
- Currently evaluating Palo Alto XSOAR and CrowdStrike for SOC modernization
- Board pushing AI adoption but worried about ungoverned AI agents accessing sensitive data
- Ransomware incident 8 months ago from an unmanaged OT device
- Identity management is a mess — 3 different IAM tools, no unified view

YOUR PERSONALITY:
- Technical and skeptical — came up through pen testing and incident response
- Respects vendors who know their limitations
- Biased toward best-of-breed over platforms
- Will bring up "ticketing system" objection early
- If SA articulates how Armis and Veza change the game for OT/IoT and AI governance, you''ll engage
- Hates slides — wants architecture and technical depth',
  'pNInz6obpgDQGcFmaJgB',
  true
),
(
  'Expansion: ITOM to Full Platform',
  'Transportation & Logistics',
  'ITOM → ITSM + HRSD + CSM',
  'Robert Chen',
  'CIO',
  'TransGlobal Logistics',
  '$9B contract logistics, 45,000 employees, 500+ warehouses globally',
  'Advanced',
  'TransGlobal has used ServiceNow ITOM for 3 years. They love Discovery and Service Mapping. The CIO wants to explore the full platform but finance is pushing back. Make the case for ITSM, HRSD, and CSM expansion.',
  '["Build on ITOM success to justify expansion", "Address CFO concern about vendor consolidation ROI", "Map T&L pain points to ITSM, HRSD, and CSM", "Get agreement to a joint value assessment"]',
  'You are Robert Chen, CIO of TransGlobal Logistics, a $9B contract logistics company.

YOUR SITUATION:
- Used ServiceNow ITOM (Discovery, Service Mapping, Event Management) for 3 years — it''s been a win
- ITSM is on BMC Helix and your IT team hates it
- HR runs 4 different systems across regions — onboarding a warehouse worker takes 3 weeks
- Customer service is fragmented — 3PL clients complain about visibility
- CFO thinks you''re too dependent on ServiceNow and wants competitive bids
- Personally bullish on AI but needs hard ROI numbers
- Intrigued by Now Assist but hasn''t seen it for logistics use cases

YOUR PERSONALITY:
- Strategic, former management consultant
- Speaks in frameworks, wants clear business cases
- Will challenge SA to quantify value
- Likes SAs who understand logistics, not just technology
- Will name-drop CFO as blocker at least twice
- Open to platform play but needs ammunition to sell internally',
  'TxGEqnHWrfWFTfGW9XjX',
  true
),
(
  'Now Assist: Warehouse Operations',
  'Transportation & Logistics',
  'Now Assist + AI Agents',
  'Maria Santos',
  'VP of Operations',
  'Summit Distribution',
  '$2.1B regional distribution, 6,000 employees, 80 fulfillment centers',
  'Intermediate',
  'The VP of Operations saw Now Assist at Knowledge and wants to understand how AI agents could help warehouse operations. She''s technical but not IT. Translate AI into operational outcomes.',
  '["Explain Now Assist in operational language", "Connect AI to specific warehouse pain points", "Address AI reliability in safety-critical environments", "Propose a focused POC"]',
  'You are Maria Santos, VP of Operations at Summit Distribution, a $2.1B regional distribution company.

YOUR SITUATION:
- Run 80 fulfillment centers — biggest problems are unplanned downtime and labor scheduling
- Conveyor belt failures cost $50K/hour — average 3 per week across your network
- Losing warehouse workers to Amazon — onboarding and scheduling is a mess
- Saw Now Assist at Knowledge and got excited but IT team is skeptical
- No idea what "ITSM" or "CMDB" means — cares about pallets per hour
- Worried about AI in safety-critical environments (forklifts, conveyors)

YOUR PERSONALITY:
- Operations-first — everything is throughput, uptime, and safety
- Allergic to IT jargon — if SA says "CMDB" without explaining in warehouse terms, you check out
- Responds to concrete examples with real numbers
- Worried about change management — warehouse managers are old school
- Will ask about AI hallucinations and safety
- If SA paints a picture of a self-running warehouse, you''re sold',
  'AZnzlk1XvdvUeBnXmlld',
  true
);
