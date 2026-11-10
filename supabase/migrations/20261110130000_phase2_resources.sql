-- Phase 2-5 — Ressources, téléchargements, favoris, signalements, modération, notifications

-- ---------------------------------------------------------------------------
-- Ressources
-- ---------------------------------------------------------------------------

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) >= 10),
  description text not null check (char_length(description) >= 30),
  level_id uuid not null references public.levels (id),
  subject_id uuid not null references public.subjects (id),
  type text not null check (type in ('COURS','EXERCICE','DEVOIR','EXAMEN','CORRIGE')),
  year int not null check (year between 1990 and 2100),
  school text,
  language text not null default 'fr',
  file_path text not null,
  file_size int not null check (file_size > 0 and file_size <= 20971520),
  page_count int not null check (page_count between 1 and 150),
  file_hash text not null unique,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  rejection_reason text check (rejection_reason in ('ILLISIBLE','DOUBLON','MAUVAISE_CLASSIFICATION','INCOMPLET','INAPPROPRIE','DROIT_AUTEUR')),
  moderated_by uuid references public.profiles (id) on delete set null,
  moderated_at timestamptz,
  download_count int not null default 0,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_status_idx on public.resources (status);
create index if not exists resources_level_subject_idx on public.resources (level_id, subject_id);
create index if not exists resources_author_idx on public.resources (author_id);
create index if not exists resources_created_idx on public.resources (created_at desc);
create index if not exists resources_download_idx on public.resources (download_count desc);

create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Téléchargements
-- ---------------------------------------------------------------------------

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  created_at timestamptz not null default now(),
  download_date date generated always as ((created_at at time zone 'utc')::date) stored
);

create unique index if not exists downloads_unique_per_day
  on public.downloads (user_id, resource_id, download_date);

create index if not exists downloads_user_idx on public.downloads (user_id);
create index if not exists downloads_resource_idx on public.downloads (resource_id);

-- ---------------------------------------------------------------------------
-- Favoris
-- ---------------------------------------------------------------------------

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

-- ---------------------------------------------------------------------------
-- Signalements
-- ---------------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  reason text not null,
  comment text,
  status text not null default 'OPEN' check (status in ('OPEN','RESOLVED')),
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status);

-- ---------------------------------------------------------------------------
-- Journal de modération
-- ---------------------------------------------------------------------------

create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  moderator_id uuid references public.profiles (id) on delete set null,
  action text not null check (action in ('APPROVE','REJECT')),
  reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Notifications in-app
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Recalcul du compteur de contributions
-- ---------------------------------------------------------------------------

create or replace function public.recalculate_approved_count(uid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set approved_count = (
       select count(*)::int from public.resources
        where author_id = uid and status = 'APPROVED'
     )
   where id = uid;
$$;

create or replace function public.resources_status_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recalculate_approved_count(new.author_id);
  elsif tg_op = 'UPDATE' then
    if new.author_id is distinct from old.author_id or new.status is distinct from old.status then
      perform public.recalculate_approved_count(old.author_id);
      perform public.recalculate_approved_count(new.author_id);
    end if;
  elsif tg_op = 'DELETE' then
    perform public.recalculate_approved_count(old.author_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists resources_status_changed on public.resources;
create trigger resources_status_changed
  after insert or update or delete on public.resources
  for each row
  execute function public.resources_status_changed();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.resources enable row level security;
alter table public.downloads enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_logs enable row level security;
alter table public.notifications enable row level security;

-- resources : lecture publique si approuvé, ou ses propres ressources
drop policy if exists "resources_public_read" on public.resources;
create policy "resources_public_read"
  on public.resources for select
  to anon, authenticated
  using (status = 'APPROVED' or author_id = auth.uid());

drop policy if exists "resources_insert_own" on public.resources;
create policy "resources_insert_own"
  on public.resources for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "resources_update_own_or_staff" on public.resources;
create policy "resources_update_own_or_staff"
  on public.resources for update
  to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin'))
  )
  with check (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin'))
  );

drop policy if exists "resources_delete_staff" on public.resources;
create policy "resources_delete_staff"
  on public.resources for delete
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- downloads : insertion uniquement si contributeur
drop policy if exists "downloads_insert_contributor" on public.downloads;
create policy "downloads_insert_contributor"
  on public.downloads for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_contributor(auth.uid()));

drop policy if exists "downloads_read_own" on public.downloads;
create policy "downloads_read_own"
  on public.downloads for select
  to authenticated
  using (user_id = auth.uid());

-- favorites
drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own"
  on public.favorites for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- reports
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "reports_read_staff" on public.reports;
create policy "reports_read_staff"
  on public.reports for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- moderation_logs : lecture staff uniquement
drop policy if exists "moderation_logs_staff_read" on public.moderation_logs;
create policy "moderation_logs_staff_read"
  on public.moderation_logs for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

drop policy if exists "moderation_logs_staff_insert" on public.moderation_logs;
create policy "moderation_logs_staff_insert"
  on public.moderation_logs for insert
  to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- notifications : chacun lit les siennes
drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own"
  on public.notifications for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage : bucket privé `resources`
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resources', 'resources', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "resources_storage_insert_own" on storage.objects;
create policy "resources_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resources_storage_read_own_or_staff" on storage.objects;
create policy "resources_storage_read_own_or_staff"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resources'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin'))
    )
  );

drop policy if exists "resources_storage_delete_own_or_staff" on storage.objects;
create policy "resources_storage_delete_own_or_staff"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resources'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin'))
    )
  );

-- Grants
grant select, insert, update, delete on public.resources to authenticated;
grant select, insert on public.downloads to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert on public.reports to authenticated;
grant select, insert on public.moderation_logs to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant select on public.resources to anon;
