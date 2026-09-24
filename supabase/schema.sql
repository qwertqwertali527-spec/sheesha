-- Run in the client's Supabase SQL editor before a production deployment.
-- All access is via the server-side service role. No direct browser access.
create table if not exists public.content (
  id text primary key,
  payload jsonb not null
);
create table if not exists public.inquiries (
  id uuid primary key,
  channel text not null check (channel in ('web', 'whatsapp')),
  channel_id text not null,
  status text not null check (status in ('collecting', 'needs_human', 'in_progress', 'closed')),
  fields jsonb not null,
  handoff_reason text,
  staff_note text not null default '',
  consent_at timestamptz,
  age_confirmed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (channel, channel_id)
);
create index if not exists inquiries_updated on public.inquiries (updated_at desc);
create table if not exists public.messages (
  id uuid primary key,
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  role text not null check (role in ('customer', 'assistant', 'human')),
  text text not null,
  created_at timestamptz not null,
  provider_message_id text unique
);
create index if not exists messages_inquiry on public.messages (inquiry_id, created_at);
create table if not exists public.webhook_events (
  id text primary key,
  created_at timestamptz not null
);

alter table public.content enable row level security;
alter table public.inquiries enable row level security;
alter table public.messages enable row level security;
alter table public.webhook_events enable row level security;
-- No policies for anon/authenticated: service role only. Never expose that key client-side.
revoke all on public.content from anon, authenticated;
revoke all on public.inquiries from anon, authenticated;
revoke all on public.messages from anon, authenticated;
revoke all on public.webhook_events from anon, authenticated;
