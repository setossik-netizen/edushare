# Intégration Google Drive (upload automatisé, stockage centralisé)

Cette configuration permet à l'application d'envoyer automatiquement les fichiers (PDF/images) des utilisateurs vers **un dossier Google Drive centralisé** (compte de la plateforme), sans que l'utilisateur n'ait à manipuler de lien.

## Important — quota de stockage (compte Google personnel gratuit)

- L'**API Google Drive** est gratuite dans les quotas standards. Le **stockage** utilise le quota du compte Google propriétaire (15 Go gratuits sur un compte personnel).
- Un **compte de service** ne possède pas de quota "Mon Drive" : sur un Drive personnel, l'upload par compte de service échoue avec `storageQuotaExceeded` (il faut un Shared Drive, généralement via Google Workspace). 
- **Solution recommandée (gratuite, Drive personnel)** : utiliser **OAuth** pour que l'application agisse au nom du propriétaire du Drive (une autorisation unique → `refresh token`). Les fichiers sont alors stockés dans le Drive du propriétaire.

## Option A — OAuth du propriétaire (recommandée)

Variables requises :
- `GOOGLE_DRIVE_FOLDER_ID` : ID du dossier de destination (extrait de `https://drive.google.com/drive/folders/<ID>`)
- `GOOGLE_CLIENT_ID` : ID client OAuth 2.0
- `GOOGLE_CLIENT_SECRET` : secret client OAuth 2.0
- `GOOGLE_REFRESH_TOKEN` : jeton d'actualisation obtenu après autorisation du propriétaire

Étapes :
1. Créer/sélectionner un projet sur [Google Cloud Console](https://console.cloud.google.com/) et activer **Google Drive API**.
2. Configurer l'écran de consentement OAuth si demandé (type Externe pour un compte personnel, ajouter votre compte en utilisateur de test si l'app est en mode test).
3. Créer un identifiant **ID client OAuth 2.0** (type Application Web ou Bureau selon la méthode utilisée) et récupérer `client_id` / `client_secret`.
4. Autoriser le scope Drive (`https://www.googleapis.com/auth/drive`) pour le compte propriétaire du dossier et obtenir un **refresh token** (autorisation unique). Vous pouvez utiliser [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) en configurant vos propres identifiants et en ajoutant `https://developers.google.com/oauthplayground` comme URI de redirection autorisée du client.
5. Créer un dossier dans Google Drive (compte propriétaire) et récupérer son ID.
6. Définir les variables d'environnement côté serveur (local/Vercel) et redéployer.

## Option B — Compte de service (Shared Drive / Workspace)

Variables requises :
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (JSON brut ou base64)

Fonctionne si le dossier cible est dans un **Shared Drive** et que le compte de service y a accès. Sur un Drive personnel gratuit, cette option ne permet pas d'uploader (pas de quota).

## Configuration des variables

### Local (`.env.local`)
```env
GOOGLE_DRIVE_FOLDER_ID=<FOLDER_ID>
GOOGLE_CLIENT_ID=<CLIENT_ID>
GOOGLE_CLIENT_SECRET=<CLIENT_SECRET>
GOOGLE_REFRESH_TOKEN=<REFRESH_TOKEN>
# ou GOOGLE_SERVICE_ACCOUNT_JSON=...
```

### Vercel
Project Settings → Environment Variables → ajouter les variables (serveur uniquement) → redéployer.

## Fonctionnement dans l'application
- L'utilisateur sélectionne un fichier (PDF, JPG, PNG, WebP, max 20 Mo) et renseigne les métadonnées.
- Le serveur téléverse le fichier dans le dossier Drive, rend le fichier accessible en lecture par lien, puis enregistre l'URL et les métadonnées en base.
- L'utilisateur ne manipule pas de lien Google Drive.
- La règle du donnant-donnant reste appliquée côté serveur.

## 5. Fonctionnement dans l'application

- L'utilisateur sélectionne un fichier (PDF, JPG, PNG, WebP, max 20 Mo) et renseigne les métadonnées.
- Le serveur téléverse le fichier dans le dossier Drive via l'API, rend le fichier accessible en lecture par lien, puis enregistre l'URL et les métadonnées en base de données.
- L'utilisateur ne voit ni ne manipule de lien Google Drive.
- La règle du donnant-donnant reste appliquée côté serveur (au moins un document approuvé pour accéder aux documents).

## Limites et remarques

- **Taille/fonctions serverless** : les hébergeurs (ex. Vercel) imposent des limites de taille de requête/corps. La limite applicative est fixée à 20 Mo ; adaptez selon votre plan et vos besoins.
- **Quota Drive** : surveillez l'espace disponible du compte Google propriétaire du dossier.
- **Confidentialité** : les fichiers approuvés/partagés sont rendus accessibles via un lien de lecture. Ne pas utiliser pour des données sensibles.
- **Validation** : le modérateur vérifie les métadonnées ; ajoutez des contrôles supplémentaires (type MIME réel, contenu) si nécessaire.
- **Sécurité** : ne jamais exposer `GOOGLE_SERVICE_ACCOUNT_JSON` côté client ni le committer. Utilisez les variables d'environnement serveur uniquement.
