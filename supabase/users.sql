create table if not exists public.users (
  id text primary key,
  username text,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_username_idx on public.users (username);
