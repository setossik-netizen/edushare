# Intégration Google Drive (upload automatisé, stockage centralisé)

Cette configuration permet à l'application d'envoyer automatiquement les fichiers (PDF/images) des utilisateurs vers **un dossier Google Drive centralisé** (compte de la plateforme), sans que l'utilisateur n'ait à manipuler de lien.

## Prérequis

- Un compte Google (Google Drive) dédié à la plateforme.
- Un projet Google Cloud (gratuit).
- Les variables d'environnement serveur : `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_DRIVE_FOLDER_ID`.

> **Coût/quota** : l'API Google Drive est gratuite dans les quotas standards. Le stockage utilisé est celui du compte Google Drive propriétaire du dossier (15 Go gratuits sur un compte personnel). Un compte de service n'a pas de quota "Mon Drive" personnel : il faut lui partager un dossier du Drive propriétaire.

## 1. Créer un projet Google Cloud et activer l'API Drive

1. Ouvrir [Google Cloud Console](https://console.cloud.google.com/) et créer un projet (ex. `edushare-storage`).
2. Aller dans **API et services → Bibliothèque**.
3. Rechercher **Google Drive API** et cliquer **Activer**.

## 2. Créer un compte de service

1. **API et services → Identifiants → Créer des identifiants → Compte de service**.
2. Nommer le compte (ex. `edushare-uploader`) et valider.
3. Ouvrir le compte de service créé → onglet **Clés** → **Ajouter une clé → Créer une clé → JSON**.
4. Télécharger le fichier JSON et le conserver en lieu sûr (ne jamais le committer).

Le JSON contient notamment `client_email` (ex. `edushare-uploader@...iam.gserviceaccount.com`) et `private_key`.

## 3. Créer et partager le dossier Google Drive

1. Dans le Google Drive du compte de la plateforme, créer un dossier (ex. `EduShare uploads`).
2. Clic droit → **Partager** → ajouter l'adresse e-mail du compte de service (`client_email`) avec le rôle **Éditeur**.
3. Récupérer l'**ID du dossier** depuis l'URL : `https://drive.google.com/drive/folders/<FOLDER_ID>`.

## 4. Configurer les variables d'environnement

### En local (`.env.local`)

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=<FOLDER_ID>
```

- `GOOGLE_SERVICE_ACCOUNT_JSON` : contenu JSON complet du compte de service (sur une seule ligne). Vous pouvez aussi fournir la même valeur encodée en **base64**.
- `GOOGLE_DRIVE_FOLDER_ID` : l'identifiant du dossier partagé.

### Sur Vercel

Project Settings → Environment Variables :

- `GOOGLE_SERVICE_ACCOUNT_JSON` = contenu du JSON (ou base64)
- `GOOGLE_DRIVE_FOLDER_ID` = ID du dossier

Redéployer après modification des variables.

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
