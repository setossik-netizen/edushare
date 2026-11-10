# Cahier des charges — EduShare

**Plateforme collaborative open source de partage de ressources scolaires**

| Champ | Détail |
| --- | --- |
| Nom de code | EduShare |
| Version | 1.0 du 10 novembre 2026 |
| Statut | MVP à réaliser, 100 % gratuit, open source |
| Licence | MIT |
| Stack recommandée | Next.js + Tailwind CSS + Supabase + Vercel |
| Public cible | Élèves, étudiants, enseignants, francophonie, priorité Bénin et Afrique de l'Ouest |

Ce document est la référence fonctionnelle et technique du projet. Il peut être donné tel
quel en contexte à un assistant de code.

## 1. Introduction et objectifs

### 1.1 Contexte

Les cours, exercices, devoirs surveillés et examens circulent aujourd'hui via WhatsApp,
photocopies ou groupes informels. Ils sont difficiles à retrouver, souvent incomplets, et
disparaissent. Les plateformes généralistes comme Scribd ne sont pas pensées pour le système
scolaire francophone, ni pour la classification par classe et matière, ni pour un modèle
équitable de contribution.

EduShare reprend le meilleur de ce modèle, la bibliothèque collaborative, en le spécialisant :
**une ressource = une classe + une matière + un type + une année**.

### 1.2 Vision

Devenir la bibliothèque scolaire collaborative de référence, où chaque élève qui télécharge a
d'abord contribué à enrichir le fonds commun.

### 1.3 Objectifs du MVP

- Permettre à n'importe qui de créer un compte gratuit en moins de 2 minutes.
- Permettre l'upload d'un PDF classifié en moins de 3 minutes.
- Permettre de retrouver une ressource en moins de 30 secondes via recherche et filtres.
- Appliquer strictement la règle du donnant-donnant : pas de téléchargement sans contribution
  validée.
- Rester à 0 € d'infrastructure en respectant les quotas gratuits.

### 1.4 Indicateurs de succès (90 jours après lancement)

- 200 ressources approuvées.
- 300 comptes créés, dont 40 % de contributeurs validés.
- Temps médian de modération inférieur à 48 h.
- Taux de rejet pour doublon ou document vide inférieur à 15 %.
- Score Lighthouse mobile supérieur à 85 sur les pages catalogue.

### 1.5 Périmètre

**Dans le MVP** : auth, profil, upload PDF, modération manuelle, catalogue, recherche et
filtres, lecteur PDF, règle donnant-donnant, téléchargement, favoris, signalement, admin.

**Hors MVP (V2)** : système de crédits (1 upload = 5 téléchargements), points et badges,
commentaires, suivi d'auteurs, application mobile, upload d'autres formats (DOCX, images),
correction communautaire, recherche plein texte dans le contenu du PDF.

### 1.6 Principes directeurs

- **Gratuit pour toujours** : aucune fonctionnalité payante dans le MVP.
- **Open source** : code, taxonomie et documentation publics.
- **Équité** : on ne consomme que si on contribue.
- **Qualité avant quantité** : un document validé vaut mieux que 10 documents vides.
- **Sobriété** : pas de fonctionnalité qui fait exploser les coûts de stockage ou de bande
  passante.

## 2. Personas et parcours utilisateurs

### 2.1 Personas

| Persona | Profil | Besoin principal | Frustration actuelle |
| --- | --- | --- | --- |
| Aïcha, 17 ans | Terminale D à Parakou | Trouver des épreuves de maths et SVT des années précédentes | Elle ne trouve que des photos floues sur WhatsApp |
| Marc, 21 ans | Étudiant en 1ère année d'université | Partager ses anciens cours de lycée pour débloquer des cours d'université | Il a déjà partagé sans jamais recevoir en retour |
| M. Bio, 34 ans | Enseignant de maths | Diffuser ses devoirs corrigés à plusieurs classes | Ses PDF se perdent et sont repartagés sans son nom |
| Léa, 26 ans | Modératrice bénévole | Garder un catalogue propre et utile | Elle passe trop de temps à trier des doublons |

### 2.2 Parcours 1 — Inscription et premier déblocage

1. Aïcha arrive sur la page d'accueil, voit le catalogue sans être connectée.
2. Elle clique sur un sujet de maths : le lecteur affiche un aperçu limité à 3 pages avec un
   bandeau « contribution requise pour télécharger ».
3. Elle crée un compte avec email et mot de passe, choisit sa classe actuelle.
4. Son statut affiché est : **Non-contributeur, 0 téléchargement débloqué**.
5. Elle uploade un devoir de SVT de sa classe, remplit titre, matière, type, année.
6. Son document passe en statut **En attente**.
7. Après validation par Léa, elle reçoit une notification : **Contributeur débloqué**.
8. Elle peut maintenant lire en intégralité et télécharger tous les documents approuvés.

### 2.3 Parcours 2 — Upload par un contributeur

1. Marc se connecte, clique sur **Partager un document**.
2. Il dépose son PDF ; le système vérifie format, taille et doublon.
3. Il complète les métadonnées obligatoires, prévisualise, envoie.
4. Il suit son document dans **Mes contributions** : En attente, Approuvé, Rejeté avec motif.
5. S'il est rejeté, il peut corriger et renvoyer une nouvelle version.

### 2.4 Parcours 3 — Recherche et téléchargement

1. M. Bio cherche : Classe = Terminale D, Matière = Mathématiques, Type = Examen, Année = 2024.
2. Il trie par **Les plus téléchargés**.
3. Il ouvre la fiche, lit l'aperçu, vérifie le nombre de pages et l'auteur.
4. Comme il est contributeur validé, le bouton **Télécharger PDF** est actif.
5. Le téléchargement est comptabilisé et l'auteur gagne en visibilité.

### 2.5 Parcours 4 — Modération

1. Léa ouvre la file **À modérer**, triée par date d'envoi.
2. Elle ouvre le PDF, vérifie lisibilité, complétude, classification et absence de doublon.
3. Elle approuve ou rejette avec un motif prédéfini.
4. L'auteur est notifié automatiquement.

## 3. Spécifications fonctionnelles détaillées

### 3.1 Arborescence et pages

| Route | Contenu |
| --- | --- |
| `/` | Accueil, recherche mise en avant, ressources récentes, comment ça marche |
| `/explorer` | Catalogue avec filtres et recherche |
| `/ressource/[id]` | Fiche détail + lecteur PDF |
| `/partager` | Formulaire d'upload |
| `/mes-contributions` | Suivi des uploads |
| `/profil` | Profil, statut contributeur, favoris, téléchargements |
| `/connexion`, `/inscription`, `/mot-de-passe-oublie` | Authentification |
| `/admin` | File de modération, gestion taxonomie, signalements, utilisateurs |

### 3.2 Authentification et comptes

**Fonctionnalités**

- Inscription par email et mot de passe, confirmation par email.
- Connexion, déconnexion, mot de passe oublié.
- Connexion via Google en V2 si besoin.
- Profil : pseudo, avatar, classe actuelle (optionnelle), bio courte.

**Règles**

- Pseudo unique, 3 à 20 caractères, sans espace.
- Mot de passe : 8 caractères minimum.
- Un compte = une adresse email.
- Suppression de compte possible, avec anonymisation des ressources déjà publiées (l'auteur
  devient « Compte supprimé »).
- Protection des mineurs : pas de données sensibles demandées, pas de messagerie privée dans
  le MVP, pas de géolocalisation.

**Critères d'acceptation**

- Un utilisateur non connecté peut consulter le catalogue mais ne peut ni uploader ni
  télécharger.
- Après inscription, le statut par défaut est `is_contributor = false`.

### 3.3 Règle du donnant-donnant

C'est la règle métier qui conditionne tout le produit.

**Définition** : un utilisateur devient **Contributeur débloqué** dès qu'il possède au moins
1 ressource au statut `APPROVED`.

**Table des droits**

| Action | Visiteur | Inscrit non-contributeur | Contributeur validé | Modérateur / Admin |
| --- | --- | --- | --- | --- |
| Consulter le catalogue | Oui | Oui | Oui | Oui |
| Lire l'aperçu (3 premières pages) | Oui | Oui | Oui | Oui |
| Lire en intégralité dans le lecteur | Non | Non | Oui | Oui |
| Télécharger le PDF | Non | Non | Oui | Oui |
| Uploader un document | Non | Oui | Oui | Oui |
| Ajouter aux favoris | Non | Oui | Oui | Oui |
| Signaler un document | Non | Oui | Oui | Oui |

**Logique de vérification**

```text
can_download(user) = user.is_authenticated AND user.contribution_approved_count >= 1
```

Le compteur est recalculé côté serveur à chaque validation ou suppression. Il ne doit jamais
être calculé uniquement côté frontend.

**Cas limites à gérer**

- Si la seule ressource approuvée d'un utilisateur est supprimée pour violation, le compteur
  retombe à 0 et les téléchargements se rebloquent.
- Si une ressource est rejetée, le compteur ne change pas.
- Un utilisateur qui tente de télécharger sans droit reçoit un message explicite et un bouton
  **Partager un document** pour débloquer, jamais une erreur technique.
- Un utilisateur ne peut pas télécharger sa propre ressource en attente pour contourner la
  règle : elle n'est pas publique.
- Le téléchargement doit passer par une URL signée temporaire, jamais par un lien public
  permanent vers le fichier.

**Anti-abus**

- Fichier PDF uniquement, 20 Mo max, 1 à 150 pages.
- Hash du fichier (SHA-256) pour détecter les doublons exacts.
- Titre minimum 10 caractères, description minimum 30 caractères.
- Interdiction des documents vides, flous, photos de cahier illisibles, pages blanches
  majoritaires.
- Limite : 5 uploads en attente maximum par utilisateur.
- Cooldown : 10 minutes entre deux uploads.
- Interdiction de re-uploader le même document d'un autre auteur.

### 3.4 Dépôt (upload)

**Champs obligatoires**

- Fichier PDF.
- Titre.
- Description.
- Classe / niveau.
- Matière.
- Type de ressource : Cours, Exercice, Devoir surveillé, Examen, Corrigé.
- Année scolaire / année d'examen.

**Champs optionnels** : établissement (texte libre), langue (français par défaut).

**Workflow**

1. Sélection du fichier, vérification client (type, taille).
2. Upload vers le stockage avec statut `PENDING`.
3. Création de la fiche ressource en base.
4. Vérification serveur : hash, nombre de pages, taille.
5. Mise en file de modération.
6. Notification à l'auteur lors du changement de statut.

**Critères d'acceptation**

- Un fichier non PDF est refusé avec un message clair.
- Un doublon exact est refusé avant l'upload complet, avec lien vers la ressource existante.
- L'utilisateur voit sa progression d'upload.

### 3.5 Modération et validation

**File de modération**

- Liste des ressources `PENDING`, triées par ancienneté.
- Vue modérateur : PDF, métadonnées, historique de l'auteur, doublons potentiels.

**Décisions**

- **Approuver** : la ressource devient publique, le compteur de l'auteur augmente de 1,
  l'auteur est notifié.
- **Rejeter** : motif obligatoire parmi : Document illisible, Doublon, Mauvaise
  classification, Document incomplet, Contenu inapproprié, Droit d'auteur suspect. Le fichier
  est supprimé du stockage après 7 jours.

**Règles**

- Un modérateur ne peut pas modérer sa propre ressource.
- Toute action de modération est journalisée : qui, quand, décision, motif.
- Objectif : décision en moins de 48 h.

### 3.6 Recherche et filtrage

**Filtres** : recherche texte (titre, description), classe, matière, type, année, tri
(pertinence, plus récents, plus téléchargés, plus vus).

**Comportement**

- La recherche fonctionne sans connexion.
- Les filtres sont cumulables et partageables via l'URL
  (`/explorer?classe=terminale-d&matiere=maths`).
- Recherche avec tolérance : « math » trouve « Mathématiques ».
- Pagination : 24 résultats par page, infinite scroll ou pagination classique.
- Page sans résultat : message utile avec suggestion de partager le document manquant.

### 3.7 Fiche ressource et lecteur PDF

**Fiche** : titre, auteur, classe, matière, type, année, nombre de pages, taille, nombre de
téléchargements, date, description, boutons Favori, Signaler, Télécharger.

**Lecteur**

- Rendu via pdf.js / `react-pdf`.
- Pour non-contributeur : seules les 3 premières pages sont affichables, les suivantes sont
  floutées avec CTA de déblocage.
- Pour contributeur : lecture intégrale en streaming, sans exposition du lien direct.
- Contrôles : zoom, plein écran, navigation par page, recherche dans le document en V2.
- Bouton Télécharger visible mais désactivé avec explication si droit insuffisant.

### 3.8 Téléchargement, favoris, signalement

- **Téléchargement** : génère une URL signée de 60 secondes, incrémente `download_count`,
  enregistre une ligne dans `downloads`.
- **Favoris** : ajout et retrait, liste dans le profil.
- **Signalement** : motif + commentaire optionnel, visible uniquement par les modérateurs.
- **Notifications MVP** : par email et dans l'interface — ressource approuvée, ressource
  rejetée, ressource signalée (modérateurs).

### 3.9 Administration

- Tableau de bord : ressources en attente, total approuvées, nouveaux utilisateurs,
  téléchargements du jour.
- Gestion de la taxonomie : ajouter une classe ou une matière sans déployer du code.
- Gestion des rôles : promouvoir un utilisateur en modérateur.
- Gestion des signalements.

## 4. Spécifications non fonctionnelles

- **Performance** : catalogue en moins de 1,5 s, lecteur qui affiche la première page en
  moins de 2 s.
- **Sécurité** : Row Level Security (RLS) activée sur toutes les tables, URLs signées,
  validation Zod côté serveur, pas de clé service en frontend.
- **Accessibilité** : contraste AA, navigation clavier, labels sur tous les formulaires.
- **SEO** : pages catalogue et fiches en rendu serveur, métadonnées dynamiques, sitemap.
- **Responsive** : mobile first, l'upload et la lecture doivent fonctionner sur mobile.
- **Données** : conformité RGPD, export et suppression de compte, pas de revente de données,
  hébergement UE si possible.
- **Coût** : architecture qui tient dans les offres gratuites.

## 5. Architecture technique recommandée

### 5.1 Choix argumenté

| Besoin | Choix recommandé | Alternative écartée | Pourquoi |
| --- | --- | --- | --- |
| Frontend + backend | Next.js 14+, TypeScript, App Router | Nuxt.js | Écosystème plus large pour PDF, SEO, Server Actions, déploiement natif sur Vercel |
| UI | Tailwind CSS + shadcn/ui | CSS pur | Rapidité, cohérence, composants accessibles prêts à l'emploi |
| Base, auth, stockage | Supabase | Firebase | PostgreSQL relationnel parfait pour le catalogue, RLS puissante, Auth et Storage intégrés, SQL lisible pour un projet open source |
| Hébergement | Vercel | Netlify | Déploiement natif Next.js, previews par PR, gratuit pour open source |
| Lecteur PDF | pdf.js via `react-pdf` | Visionneuse native du navigateur | Contrôle de l'aperçu limité, pas d'exposition du fichier brut |

Si l'équipe maîtrise déjà Vue, Nuxt + Supabase reste valide. Ne pas choisir Firebase : son
modèle NoSQL complique les filtres croisés classe et matière.

### 5.2 Schéma d'architecture

```text
Navigateur
  -> Next.js sur Vercel (pages, Server Actions, Route Handlers)
    -> Supabase Auth (session, JWT)
    -> Supabase PostgreSQL via RLS (catalogue, profils, téléchargements)
    -> Supabase Storage (bucket privé `resources`, URLs signées)
    -> Supabase Edge Functions (optionnel : calcul du hash, nettoyage)
```

Le bucket Storage est privé. Aucun fichier n'est public. Toute lecture ou téléchargement
passe par une Route Handler Next.js qui vérifie le droit puis génère une URL signée.

### 5.3 Arborescence du projet

```text
/app
  /(public)/explorer, /ressource/[id]
  /(auth)/connexion, /inscription
  /(protected)/partager, /mes-contributions, /profil
  /(admin)/admin
  /api/download/[id], /api/preview/[id]
/components
  /ui, /resource-card, /pdf-viewer, /filters
/lib
  /supabase, /auth, /permissions, /validation
/supabase
  /migrations
/public
/docs
```

### 5.4 Modèle de données

**`profiles`**

- `id` uuid, PK, FK vers `auth.users`
- `username` text unique
- `avatar_url` text
- `current_level_id` uuid nullable
- `role` text : `user`, `moderator`, `admin`
- `approved_count` int par défaut 0
- `is_contributor` bool calculé
- `created_at`, `updated_at`

**`levels` (classes)**

- `id` uuid PK
- `slug` text unique
- `label` text
- `cycle` text : `primaire`, `college`, `lycee`, `universite`
- `order_index` int

Exemple : 6eme, 5eme, 4eme, 3eme, 2nde, 1ere, terminale-a, terminale-c, terminale-d.

**`subjects` (matières)**

- `id` uuid PK
- `slug` text unique
- `label` text
- `icon` text

Exemple : Mathématiques, SVT, Physique-Chimie, Français, Anglais, Histoire-Géo, Philosophie.

**`resources` (cœur)**

- `id` uuid PK
- `author_id` uuid FK `profiles`
- `title` text, `description` text
- `level_id` uuid FK `levels`, `subject_id` uuid FK `subjects`
- `type` text : `COURS`, `EXERCICE`, `DEVOIR`, `EXAMEN`, `CORRIGE`
- `year` int
- `school` text nullable
- `file_path` text, `file_size` int, `page_count` int, `file_hash` text unique
- `status` text : `PENDING`, `APPROVED`, `REJECTED`
- `rejection_reason` text nullable, `moderated_by` uuid nullable, `moderated_at` timestamptz nullable
- `download_count` int, `view_count` int
- `created_at`, `updated_at`

**`downloads`**

- `id` uuid PK
- `user_id` uuid FK
- `resource_id` uuid FK
- `created_at`
- contrainte unique `(user_id, resource_id, date)` pour éviter le spam de compteur si besoin.

**`favorites`**

- `user_id` uuid, `resource_id` uuid, PK composite, `created_at`.

**`reports`**

- `id` uuid PK, `reporter_id` uuid, `resource_id` uuid
- `reason` text, `comment` text nullable
- `status` text : `OPEN`, `RESOLVED`
- `created_at`

**`moderation_logs`**

- `id` uuid PK, `resource_id` uuid, `moderator_id` uuid
- `action` text, `reason` text nullable, `created_at`

**Exemple SQL simplifié**

```sql
create table resources (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  title text not null check (char_length(title) >= 10),
  description text not null check (char_length(description) >= 30),
  level_id uuid references levels(id) not null,
  subject_id uuid references subjects(id) not null,
  type text not null check (type in ('COURS','EXERCICE','DEVOIR','EXAMEN','CORRIGE')),
  year int not null,
  file_path text not null,
  file_hash text unique not null,
  status text not null default 'PENDING',
  download_count int not null default 0,
  created_at timestamptz default now()
);
```

### 5.5 Règles RLS à implémenter

- **`resources`** : lecture publique uniquement si `status = 'APPROVED'`. Lecture de ses
  propres ressources quel que soit le statut. Écriture : auteur uniquement. Mise à jour du
  statut : modérateur et admin uniquement.
- **`profiles`** : lecture publique du pseudo et de l'avatar, écriture de son propre profil
  uniquement.
- **`downloads`** : insertion uniquement si l'utilisateur est contributeur, vérifiée par une
  fonction SQL `is_contributor(uid)`.
- **Storage** : lecture et écriture uniquement via des URLs signées générées côté serveur.

### 5.6 Stratégie zéro coût

| Service | Offre gratuite | Stratégie pour rester gratuit |
| --- | --- | --- |
| Supabase | 500 Mo BDD, 1 Go Storage, 50k utilisateurs mensuels | PDF limité à 20 Mo, suppression des rejetés après 7 jours, pas de stockage des originaux en double |
| Vercel | 100 Go de bande passante, builds Hobby | Images optimisées, pas de vidéo, cache sur le catalogue |
| GitHub | Repos publics illimités, Actions gratuites | CI légère, pas de builds lourds |

Si le stockage approche 80 %, activer : alerte admin, purge des brouillons, baisse de la
limite à 15 Mo, compression côté client en V2.

## 6. Plan de réalisation

À exécuter dans l'ordre. Chaque phase se termine par un commit et une vérification manuelle.

### Phase 0 — Fondations

> Initialise un projet Next.js 14 avec TypeScript, App Router, Tailwind CSS et shadcn/ui.
> Configure Supabase Auth, crée `.env.example` avec `NEXT_PUBLIC_SUPABASE_URL` et
> `NEXT_PUBLIC_SUPABASE_ANON_KEY`, puis un layout avec header, footer et page d'accueil.

- **Livrable** : projet qui démarre, déployé sur Vercel.
- **Fini quand** : `npm run dev` fonctionne, dépôt GitHub créé avec README, LICENSE MIT et
  CONTRIBUTING.md.

### Phase 1 — Auth et profils

> Implémente l'auth Supabase : inscription, connexion, mot de passe oublié, protection des
> routes `/partager` et `/profil`. Crée la table `profiles` avec trigger à l'inscription, les
> tables `levels` et `subjects` avec seed pour le système béninois et francophone.

- **Livrable** : inscription, connexion, profil avec statut contributeur affiché.
- **Fini quand** : un nouvel utilisateur a `approved_count = 0` et voit le bandeau de
  déblocage.

### Phase 2 — Upload et modération

> Implémente le formulaire `/partager` avec validation Zod, upload vers le bucket privé
> `resources`, calcul du hash SHA-256, vérification des doublons, création de la ressource en
> `PENDING`. Implémente la page `/admin` avec file de modération, approbation et rejet avec
> motif, et journalisation.

- **Livrable** : upload complet, file modérateur fonctionnelle.
- **Fini quand** : un document approuvé fait passer `approved_count` à 1 et débloque le
  compte.

### Phase 3 — Catalogue, recherche, fiche

> Implémente `/explorer` avec recherche texte, filtres classe, matière, type, année, tri et
> pagination, filtres synchronisés avec l'URL. Implémente la fiche `/ressource/[id]` avec
> métadonnées, favoris et signalement.

- **Fini quand** : une recherche Terminale D + Maths + Examen retourne les bons résultats en
  moins de 1,5 s.

### Phase 4 — Lecteur PDF et règle donnant-donnant

> Implémente le lecteur PDF avec `react-pdf`, aperçu limité à 3 pages pour les
> non-contributeurs, lecture intégrale pour les contributeurs. Implémente la fonction
> `canDownload(userId)` côté serveur et la route `/api/download/[id]` qui génère une URL
> signée de 60 secondes et incrémente le compteur. Le bouton Télécharger doit être désactivé
> avec explication si le droit est insuffisant.

- **Fini quand** : un non-contributeur ne peut pas télécharger même en appelant l'API
  directement, un contributeur le peut.

### Phase 5 — Profil, favoris, notifications

> Implémente `/mes-contributions`, `/profil` avec favoris et historique de téléchargements,
> et les notifications par email Supabase Auth pour approbation et rejet.

- **Fini quand** : l'utilisateur voit le statut de chaque upload et reçoit un email à chaque
  décision.

### Phase 6 — Qualité, SEO, lancement

> Ajoute le SEO dynamique, le sitemap, les pages légales (CGU, confidentialité, droit
> d'auteur), les tests de la règle donnant-donnant, le responsive mobile, et le README complet
> avec captures et instructions d'installation.

- **Fini quand** : Lighthouse supérieur à 85, tests manuels de tous les parcours validés,
  déploiement production.

### Checklist finale avant lancement

- [ ] RLS testée avec un compte non-contributeur, un contributeur, un modérateur.
- [ ] Tentative de téléchargement direct sans droit bloquée.
- [ ] Upload d'un PDF de 25 Mo refusé.
- [ ] Upload d'un doublon refusé.
- [ ] Suppression de compte testée.
- [ ] Mentions de respect du droit d'auteur, bouton Signaler visible.

## 7. Annexes

### 7.1 Taxonomie de départ (Bénin / francophone)

- **Cycles** : Primaire (CI, CP, CE1, CE2, CM1, CM2), Collège (6e, 5e, 4e, 3e), Lycée
  (2nde, 1ère, Terminale A, C, D), Université (Licence 1, 2, 3).
- **Matières** : Mathématiques, SVT, Physique-Chimie, Français, Anglais, Histoire-Géographie,
  Philosophie, Économie, Informatique.

### 7.2 Règles éditoriales

Tout document doit être lisible, complet, correctement classifié et légalement partageable.
Les manuels scolaires complets scannés, les contenus haineux, les données personnelles (nom,
téléphone dans le PDF) et les documents vides sont rejetés.

### 7.3 Risques principaux

- **Abus** : documents vides pour débloquer. Mitigation : validation humaine, hash, limite de
  5 documents en attente.
- **Droit d'auteur** : signalement rapide et suppression sous 24 h.
- **Coûts** : stockage. Mitigation : quotas, purge, limites.
- **Modération lente** : recrutement de modérateurs bénévoles par matière.
