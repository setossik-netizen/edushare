# EduShare

**La bibliothèque scolaire collaborative du monde francophone.**

EduShare rassemble les cours, exercices, devoirs surveillés et examens qui circulent
aujourd'hui sur WhatsApp, en photocopies ou dans des groupes informels. Chaque ressource est
classée par **classe**, **matière**, **type** et **année**, et le catalogue est consultable
sans compte.

Le projet applique une règle simple et équitable : **le donnant-donnant**. Un document
partagé et validé par un modérateur ouvre l'accès à la lecture intégrale et au téléchargement
de toute la bibliothèque. Les visiteurs et les inscrits qui n'ont encore rien publié ne voient
qu'un aperçu de 3 pages.

- 100 % gratuit, sans publicité, sans fonctionnalité payante
- Open source sous licence MIT
- Pensé pour le Bénin et l'Afrique de l'Ouest, ouvert à toute la francophonie
- Architecture pensée pour rester à faible coût (Supabase + Vercel + Google Drive API)

> **Statut : phase 0 terminée.** Les fondations et la page d'accueil sont en place.
> L'authentification, l'upload, la modération, le catalogue et le lecteur PDF arrivent dans
> les phases suivantes. Voir la feuille de route ci-dessous.

## Stack

| Besoin | Choix |
| --- | --- |
| Frontend + backend | Next.js 16 (App Router), TypeScript, Server Actions |
| UI | Tailwind CSS v4, shadcn/ui (Base UI), lucide-react |
| Base, auth | Supabase (PostgreSQL, Auth) |
| Stockage des fichiers | Google Drive centralisé (upload automatisé via API) |
| Hébergement | Vercel |

## Démarrage

Prérequis : Node.js 20.9+ et npm.

```bash
git clone <url-du-depot> edushare
cd edushare
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
npm run dev
```

L'application démarre sur <http://localhost:3000>.

Sans variables Supabase, le catalogue et les pages publiques fonctionnent quand même : le
client Supabase n'est instancié que lorsque l'authentification est réellement utilisée.

### Variables d'environnement

| Variable | Portée | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + serveur | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + serveur | Clé publique, protégée par RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur uniquement | Scripts de maintenance et seed |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | serveur uniquement | Clé JSON du compte de service Google (Drive API) |
| `GOOGLE_DRIVE_FOLDER_ID` | serveur uniquement | ID du dossier Drive de destination |
| `NEXT_PUBLIC_SITE_URL` | client + serveur | URL publique (redirections auth, SEO) |

Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au navigateur ni la committer.

## Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
```

## Authentification

L'authentification repose sur Supabase Auth et `@supabase/ssr` (cookies HTTP, RLS).
Guide de mise en place : [`docs/supabase-setup.md`](docs/supabase-setup.md).

Routes concernées :

- Public : `/connexion`, `/inscription`, `/mot-de-passe-oublie`,
  `/reinitialiser-mot-de-passe`, `/auth/callback`.
- Protégées : `/profil`, `/partager`, `/mes-contributions`, `/admin`.

Sans projet Supabase configuré, les pages publiques fonctionnent et les écrans d'auth
affichent les instructions de configuration.

## Structure du projet

```text
app/
  page.tsx                 # accueil : hero, recherche, comment ça marche, matières
  explorer/                # catalogue et filtres (phase 3)
  partager/                # formulaire d'upload (phase 2)
  connexion/ inscription/  # authentification (phase 1)
  admin/                   # modération (phase 2)
components/
  ui/                      # composants shadcn/ui
  site-header.tsx          # en-tête, navigation, menu mobile
  site-footer.tsx          # pied de page
lib/
  supabase/                # clients navigateur, serveur et proxy
  taxonomy.ts              # classes, matières, types, limites métier
docs/
  cahier-des-charges.md    # spécification fonctionnelle complète
proxy.ts                   # rafraîchissement de session Supabase (Next.js 16)
```

### Note sur Next.js 16

Next.js 16 a renommé la convention `middleware.ts` en `proxy.ts`. Le rafraîchissement de
session Supabase vit dans `lib/supabase/middleware.ts` et est branché par `proxy.ts`.

## Règle métier centrale

```text
can_download(user) = user.is_authenticated AND user.approved_count >= 1
```

Elle est **toujours** vérifiée côté serveur, dans une Route Handler ou une Server Action, et
jamais uniquement dans l'interface. Les fichiers sont téléversés automatiquement vers un
Google Drive centralisé (API Google Drive) ; la base de données stocke l'URL du document et
ses métadonnées.

## Feuille de route

- [x] **Phase 0 — Fondations** : Next.js, Tailwind, shadcn/ui, clients Supabase, layout,
      en-tête, pied de page, accueil, README, licence MIT, CONTRIBUTING.
- [x] **Phase 1 — Auth et profils** : inscription, connexion, mot de passe oublié, routes
      protégées, tables `profiles`, `levels`, `subjects` et seed du système béninois.
      Guide de mise en place : `docs/supabase-setup.md`.
- [x] **Phase 2 — Upload et modération** : formulaire d'envoi de fichier (PDF/image),
      upload automatisé vers Google Drive centralisé, validation Zod, modération, journalisation.
- [ ] **Phase 3 — Catalogue** : recherche, filtres cumulables synchronisés avec l'URL,
      tri, pagination, fiche ressource.
- [x] **Phase 4 — Règle donnant-donnant** : accès au document réservé aux contributeurs
      validés, consultation verrouillée pour les non-contributeurs.
- [x] **Phase 5 — Profil et notifications** : mes contributions, favoris, historique,
      notifications in-app.
- [x] **Phase 6 — Qualité et lancement** : SEO, sitemap, pages légales, tests, responsive.

## Contribuer

Les contributions sont bienvenues : code, taxonomie, documentation, modération. Lire
[CONTRIBUTING.md](CONTRIBUTING.md) avant d'ouvrir une pull request.

## Licence

[MIT](LICENSE). Le code, la taxonomie et la documentation sont publics et réutilisables.
