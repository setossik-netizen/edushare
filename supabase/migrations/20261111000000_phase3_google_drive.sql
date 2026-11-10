-- Phase 3 — Remplacement du stockage Supabase par des liens Google Drive
-- Les fichiers ne sont plus hébergés sur notre infrastructure : l'utilisateur
-- fournit un lien de partage Google Drive public.

-- 1. Supprimer les colonnes liées au stockage de fichiers
alter table public.resources
  drop column if exists file_path,
  drop column if exists file_size,
  drop column if exists page_count,
  drop column if exists file_hash;

-- 2. Ajouter la colonne Google Drive URL
alter table public.resources
  add column if not exists google_drive_url text not null default '';

-- 3. Supprimer la contrainte unique sur file_hash (n'existe plus)
-- (déjà supprimé avec la colonne)

-- 4. Supprimer l'index file_hash s'il existe
drop index if exists resources_file_hash_idx;

-- 5. Ajouter une contrainte de validation sur l'URL
alter table public.resources
  add constraint resources_google_drive_url_check
  check (google_drive_url ~ '^https://(drive|docs)\.google\.com/');

-- 6. Retirer la contrainte file_size (n'existe plus)
-- (déjà supprimé avec la colonne)

-- 7. Supprimer le bucket Storage (optionnel, à faire manuellement dans le dashboard)
-- delete from storage.buckets where id = 'resources';

-- 8. Mettre à jour les politiques RLS (pas de changement majeur, les ressources restent protégées par statut)
-- Les politiques existantes sur resources restent valides.
