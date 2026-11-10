# Contribuer à EduShare

Merci de prendre le temps d'aider. Ce document décrit l'essentiel pour proposer une
contribution utile, sans casser la règle métier du projet.

## Code de conduite

Le projet sert des élèves, des étudiants et des enseignants, parfois mineurs. Les échanges
doivent rester respectueux, sans données personnelles, sans démarchage et sans contenu
inapproprié.

## Mise en place

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sans clés Supabase, les pages publiques fonctionnent. Pour tester l'authentification ou le
stockage, créer un projet Supabase et renseigner les variables dans `.env.local`.

## Avant d'ouvrir une pull request

```bash
npm run lint
npm run build
```

Le build doit passer sans erreur de type ni avertissement bloquant. Vérifier aussi :

- le rendu mobile (menu, formulaire, lecteur PDF) ;
- la navigation au clavier et les labels de formulaire ;
- qu'aucune clé secrète n'apparaît dans le code ou les commits ;
- que la règle du donnant-donnant est vérifiée côté serveur si la contribution touche aux
  téléchargements.

## Conventions

- **Langue du produit** : français. Le code, les noms de variables et les commits restent en
  anglais.
- **Commits** : format court `type(scope): description`, par exemple
  `feat(auth): add email confirmation`.
- **Composants** : privilégier les composants shadcn/ui existants (`components/ui`) et les
  Server Components. Ajouter `"use client"` uniquement quand c'est nécessaire.
- **Validation** : tout formulaire est validé côté serveur avec Zod, même si le client
  valide déjà.
- **Données** : activer RLS sur chaque nouvelle table et écrire la politique avant le code
  applicatif.
- **Pas de lien public vers un fichier** : uniquement des URLs signées temporaires.

## Architecture et décisions

Les décisions structurantes sont décrites dans
[docs/cahier-des-charges.md](docs/cahier-des-charges.md) (sections 3 et 5). En cas de doute,
ouvrir une issue avant de coder un changement qui touche au modèle de données, aux droits
d'accès ou au stockage.

## Signaler un problème

Une issue doit contenir : le comportement attendu, le comportement observé, les étapes de
reproduction, la version du navigateur et, si possible, une capture d'écran.
