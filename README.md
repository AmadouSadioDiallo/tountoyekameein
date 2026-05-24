# Gestion des Adhérents — Angular + Google Sheets

Application Angular 18 (standalone, signals) qui utilise un Google Sheet comme base de données via l'API Google Sheets v4 + OAuth 2.0 (Google Identity Services).

## ✨ Fonctionnalités

- 🔐 Connexion Google (OAuth) avec gestion de rôles **ADMIN** / **STANDARD**
- 👥 CRUD complet des personnes (les standards consultent uniquement)
- 💰 Gestion des cotisations (historique des paiements par personne)
- 📊 Dashboard avec statistiques
- 🔍 Recherche multi-champs + filtres
- 📜 Historique de toutes les actions (audit log)
- ✅ Suppression logique (récupérable)
- 🎨 UI Angular Material

## 🏗️ Architecture

```
src/app/
├── core/
│   ├── models/          ← Types TS (Person, Cotisation, User, Audit)
│   ├── services/        ← Repositories + Facades + Auth
│   ├── guards/          ← authGuard, adminGuard
│   └── utils/           ← Sheet mapper, ID generator
├── features/
│   ├── auth/            ← Login
│   ├── dashboard/       ← Stats
│   ├── persons/         ← List, Form, Detail
│   ├── cotisations/     ← Contributors, Non-contributors
│   ├── historique/      ← Audit log
│   └── shared/          ← Composants partagés (dialog)
└── layouts/             ← Layout principal (sidenav + topbar)
```

**Principes Clean Code appliqués** :
- Repository pattern (séparation logique métier / persistance)
- Façades pour l'orchestration (repo + audit automatique)
- Services à responsabilité unique
- Typage strict (aucun `any` non justifié)
- Signals pour l'état réactif moderne
- Lazy loading des routes

## 🚀 Démarrage rapide

### 1. Configuration Google

Suivre les guides détaillés (5-10 minutes) :
- [`docs/01-SETUP-GOOGLE-CLOUD.md`](docs/01-SETUP-GOOGLE-CLOUD.md) — créer le projet, activer l'API, obtenir Client ID + API Key
- [`docs/02-SETUP-GOOGLE-SHEET.md`](docs/02-SETUP-GOOGLE-SHEET.md) — créer le Sheet avec les 4 onglets

### 2. Configuration de l'app

Remplir `src/environments/environment.ts` :

```typescript
googleClientId: 'VOTRE_CLIENT_ID.apps.googleusercontent.com',
googleApiKey:   'VOTRE_API_KEY',
spreadsheetId:  'VOTRE_SPREADSHEET_ID',
```

### 3. Installation & lancement

```bash
npm install
npm start
```

→ Ouvrir http://localhost:4200

### 4. Premier login

1. Cliquer sur **Se connecter avec Google**
2. Choisir un compte (qui doit être dans le tableau `Users` du Sheet **ET** dans les "utilisateurs de test" de l'écran de consentement OAuth tant que l'app est en mode "Test")
3. Vous arrivez sur le dashboard

## 📊 Modèle de données (Google Sheet)

### Onglet `Persons` (16 colonnes)
`id | civilite | nom | prenom | email | telephone | dateNaissance | lieuNaissance | adresse | ville | pays | statut | notes | dateCreation | dateModif | supprime`

### Onglet `Cotisations` (6 colonnes)
`id | personId | montant | date | notes | supprime`

### Onglet `Users` (3 colonnes)
`email | role | actif`

### Onglet `Historique` (6 colonnes)
`timestamp | userEmail | action | entity | entityId | details`

## 🔒 Sécurité

⚠️ **Important** : Le scope OAuth `.spreadsheets` donne accès à TOUS les Sheets de l'utilisateur connecté. C'est nécessaire pour l'écriture mais à savoir.

⚠️ **Côté frontend uniquement** : toute la logique (y compris la vérification du rôle) tourne dans le navigateur. Un utilisateur Standard motivé peut techniquement contourner les guards et appeler les fonctions admin via la console. C'est acceptable pour une app interne avec des utilisateurs de confiance, mais **pas pour une app publique avec données sensibles**. Pour ce cas, ajouter un backend (Node.js / Cloud Functions) qui vérifie le rôle côté serveur.

## 🌐 Déploiement (Firebase Hosting recommandé)

```bash
npm i -g firebase-tools
firebase login
firebase init hosting
# - Public directory : dist/gestion-adherents/browser
# - SPA : Yes (rewrites all to /index.html)

npm run build
firebase deploy
```

→ Récupérer l'URL de prod, puis dans Google Cloud Console > Identifiants > votre Client ID OAuth :
- Ajouter l'URL à **Origines JavaScript autorisées**
- Ajouter l'URL à la **clé API** > restrictions HTTP

## 🐛 Dépannage

**"Popup blocked"** → autoriser les popups pour `accounts.google.com` dans votre navigateur.

**"Access denied" / "Email non autorisé"** → l'email n'est pas dans la feuille `Users` (avec `actif = TRUE`) OU pas dans les utilisateurs de test de l'écran de consentement OAuth.

**Erreur 403 sur l'API Sheets** → la clé API est restreinte à un autre référent HTTP, ou l'API Sheets n'est pas activée sur le projet GCP.

**Erreur CORS** → vérifier que `http://localhost:4200` est dans **Origines JavaScript autorisées** du Client OAuth.

## 📝 Évolutions possibles

- Ajouter le CRUD des cotisations (composant `cotisation-form.component.ts` similaire à `person-form`)
- Export CSV/Excel
- Pagination côté serveur si > 5000 personnes (Google Sheets limite à 10M cellules)
- PWA pour utilisation hors-ligne avec cache
- Tests unitaires (Jest/Karma)
