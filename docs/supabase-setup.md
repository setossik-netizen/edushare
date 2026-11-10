# Mettre en place Supabase pour EduShare

Ce guide accompagne la phase 1 (authentification et profils). Comptez environ 10 minutes.

## 1. Créer le projet

1. Connectez-vous sur [supabase.com](https://supabase.com) et créez un projet.
2. Notez **l'URL du projet** et la **clé anonyme (anon key)** (Project Settings → API).
3. Dans le projet EduShare, copiez `.env.example` en `.env.local` et renseignez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (par exemple `http://localhost:3000`)

Ne mettez jamais la clé `service_role` dans `.env.local` côté client.

## 2. Appliquer les migrations

Dans le SQL Editor de Supabase, exécutez dans l'ordre :

1. `supabase/migrations/20261110120000_phase1_profiles_taxonomy.sql`
2. `supabase/seed.sql`

Vous pouvez aussi les lancer avec la CLI Supabase (`supabase db push`) si vous l'avez.

## 3. Configurer l'authentification par email

Authentication → URL Configuration :

- **Site URL** : `http://localhost:3000` (puis votre domaine de production).
- **Redirect URLs** : ajoutez `http://localhost:3000/auth/callback` et
  `https://votre-domaine/auth/callback`.

Pour le MVP, laissez la confirmation par email activée. Vous pouvez la désactiver en
développement (Authentication → Providers → Email → « Confirm email ») pour tester plus
rapidement.

## 4. Vérifier

- Redémarrez le serveur (`npm run dev`).
- Allez sur `/inscription` : le formulaire doit apparaître.
- Créez un compte. Vous recevez un email de confirmation.
- Après confirmation, `/profil` affiche votre pseudo, votre rôle (`user`) et votre statut
  non-contributeur (`approved_count = 0`).

## 5. Promouvoir un administrateur ou un modérateur

Une fois inscrit, dans le SQL Editor :

```sql
update public.profiles
   set role = 'admin'
 where username = 'votre_pseudo';
```

Le rôle est visible dans le menu utilisateur de l'en-tête.

## Dépannage

- `Supabase n'est pas configuré` : vérifiez `.env.local` et redémarrez.
- `Ce pseudo est déjà utilisé` : le pseudo est unique sans tenir compte de la casse.
- `Invalid login credentials` : email ou mot de passe incorrect, ou adresse non confirmée.
- Les tables `levels` / `subjects` sont vides : rejouez `supabase/seed.sql`.
