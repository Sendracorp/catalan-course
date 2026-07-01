-- Email leads captured from the free course preview (opt-in lead magnet: IPA
-- cheatsheet). Not tied to auth.users — these are anonymous visitors who gave
-- an email but haven't signed up. Used to nurture toward a purchase and to
-- build a launch/announce audience. Written only by the server (service role);
-- RLS on with no policies blocks all anon/authenticated access.
create table if not exists public.email_leads (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  source         text,                         -- e.g. 'unit-preview:catalan-a1:1'
  locale         text,                         -- teaching medium / marketing locale at capture
  attribution    jsonb,                        -- first-touch utm_*/gclid/referrer (same shape as purchases.attribution)
  confirmed      boolean not null default false,   -- reserved for future double opt-in
  unsubscribed_at timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists email_leads_created_idx on public.email_leads (created_at desc);

alter table public.email_leads enable row level security;
-- No policies on purpose: only the service-role client (server actions) touches
-- this table. Anon/authenticated clients are fully denied by RLS.
