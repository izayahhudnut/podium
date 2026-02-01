create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  owner_username text not null,
  title text not null,
  slug text not null,
  template text,
  livekit_room text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists rooms_owner_id_idx on public.rooms (owner_id);
create unique index if not exists rooms_owner_username_slug_idx on public.rooms (owner_username, slug);
