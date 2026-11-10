-- Phase 1 — Authentification, profils et taxonomie
-- À exécuter dans le SQL Editor Supabase, ou via `supabase db push`.
--
-- Cette migration crée :
--   * levels / subjects : la taxonomie scolaire (seed dans supabase/seed.sql)
--   * profiles : le profil public, rattaché à auth.users
--   * le trigger de création automatique du profil à l'inscription
--   * les politiques RLS et les droits par colonne

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Taxonomie
-- ---------------------------------------------------------------------------

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  cycle text not null check (cycle in ('primaire', 'college', 'lycee', 'universite')),
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  icon text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  bio text,
  current_level_id uuid references public.levels (id) on delete set null,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  approved_count int not null default 0 check (approved_count >= 0),
  -- Source de vérité du donnant-donnant, calculée par PostgreSQL.
  is_contributor boolean generated always as (approved_count >= 1) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    char_length(username) between 3 and 20
    and username !~ '\s'
  )
);

-- Un pseudo est unique sans tenir compte de la casse.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Création automatique du profil à l'inscription
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired text;
  candidate text;
  suffix int := 0;
  level_id uuid;
begin
  desired := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(coalesce(new.email, 'membre'), '@', 1)
  );
  desired := regexp_replace(desired, '\s+', '', 'g');
  desired := left(desired, 20);

  if char_length(desired) < 3 then
    desired := 'membre';
  end if;

  candidate := desired;
  while exists (
    select 1 from public.profiles p where lower(p.username) = lower(candidate)
  ) loop
    suffix := suffix + 1;
    candidate := left(desired, 20 - char_length(suffix::text)) || suffix::text;
  end loop;

  -- La classe est optionnelle : un UUID invalide est simplement ignoré.
  select l.id
    into level_id
    from public.levels l
   where l.id::text = nullif(new.raw_user_meta_data ->> 'current_level_id', '')
   limit 1;

  insert into public.profiles (id, username, current_level_id)
  values (new.id, candidate, level_id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Fonction métier : le donnant-donnant
-- ---------------------------------------------------------------------------

create or replace function public.is_contributor(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles
     where id = uid
       and approved_count >= 1
  );
$$;

revoke all on function public.is_contributor(uuid) from public;
grant execute on function public.is_contributor(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS et droits
-- ---------------------------------------------------------------------------

alter table public.levels enable row level security;
alter table public.subjects enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "levels_public_read" on public.levels;
create policy "levels_public_read"
  on public.levels for select
  to anon, authenticated
  using (true);

drop policy if exists "subjects_public_read" on public.subjects;
create policy "subjects_public_read"
  on public.subjects for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "levels_staff_write" on public.levels;
create policy "levels_staff_write"
  on public.levels for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = auth.uid() and p.role in ('moderator', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
       where p.id = auth.uid() and p.role in ('moderator', 'admin')
    )
  );

drop policy if exists "subjects_staff_write" on public.subjects;
create policy "subjects_staff_write"
  on public.subjects for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = auth.uid() and p.role in ('moderator', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
       where p.id = auth.uid() and p.role in ('moderator', 'admin')
    )
  );

-- Un utilisateur ne peut modifier que ses propres colonnes éditoriales :
-- ni son rôle, ni son compteur de contributions.
revoke all on public.profiles from anon, authenticated;
grant select (
  id, username, avatar_url, bio, current_level_id, role,
  approved_count, is_contributor, created_at
) on public.profiles to anon, authenticated;
grant update (username, avatar_url, bio, current_level_id)
  on public.profiles to authenticated;

grant select on public.levels to anon, authenticated;
grant select on public.subjects to anon, authenticated;
grant insert, update, delete on public.levels to authenticated;
grant insert, update, delete on public.subjects to authenticated;
