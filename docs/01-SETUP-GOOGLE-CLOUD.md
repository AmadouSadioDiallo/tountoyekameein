# Configuration Google Cloud — Pas à pas

## 1. Créer un projet Google Cloud

1. Aller sur https://console.cloud.google.com
2. En haut, cliquer sur le sélecteur de projet → **Nouveau projet**
3. Nom : `gestion-adherents` (ou ce que vous voulez)
4. Créer

## 2. Activer l'API Google Sheets

1. Menu ☰ → **APIs et services** → **Bibliothèque**
2. Chercher `Google Sheets API` → cliquer → **Activer**

## 3. Configurer l'écran de consentement OAuth

1. Menu ☰ → **APIs et services** → **Écran de consentement OAuth**
2. Type d'utilisateur : **Externe** → Créer
3. Remplir :
   - Nom de l'application : `Gestion Adhérents`
   - Email d'assistance utilisateur : votre email
   - Coordonnées du développeur : votre email
4. **Enregistrer et continuer**
5. **Scopes** → **Ajouter ou supprimer des scopes** :
   - Cocher : `.../auth/spreadsheets` (lecture/écriture des feuilles)
   - Cocher : `.../auth/userinfo.email` (récupérer l'email de l'utilisateur connecté)
   - Cocher : `.../auth/userinfo.profile`
   - Mettre à jour
6. **Utilisateurs de test** : ajouter votre email + ceux des admins/standards qui testeront
   (tant que l'app est en mode "Test", seuls ces emails peuvent se connecter — passer en "Production" plus tard quand prêt)
7. **Enregistrer et continuer** jusqu'à la fin

## 4. Créer les identifiants OAuth 2.0

1. Menu ☰ → **APIs et services** → **Identifiants**
2. **+ Créer des identifiants** → **ID client OAuth**
3. Type d'application : **Application Web**
4. Nom : `Angular Web Client`
5. **Origines JavaScript autorisées** (ajouter ces URLs) :
   ```
   http://localhost:4200
   ```
   (et plus tard l'URL de production, ex: `https://votre-projet.web.app`)
6. **URI de redirection autorisés** : laisser vide (on utilise GIS, pas le flow de redirection)
7. Créer
8. **Copier le Client ID** (de la forme `xxxxx.apps.googleusercontent.com`)
   → Vous en aurez besoin dans `src/environments/environment.ts`

## 5. Créer la clé API (pour l'initialisation de gapi)

1. Toujours dans **Identifiants**
2. **+ Créer des identifiants** → **Clé API**
3. **Copier la clé API**
4. (Optionnel mais recommandé) Cliquer sur la clé créée → **Restrictions de l'application** :
   - Référents HTTP → ajouter `http://localhost:4200/*` et votre URL de prod
   - **Restrictions d'API** → Restreindre la clé → cocher uniquement `Google Sheets API`

## 6. Récupérer

À la fin de cette étape, vous devez avoir :

```
CLIENT_ID    = xxxxxx.apps.googleusercontent.com
API_KEY      = AIzaxxxxxxxxxxxxx
```

→ Passer à l'étape suivante : `02-SETUP-GOOGLE-SHEET.md`
