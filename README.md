# MedSearch (MS)

Application web progressive (PWA) d'**aide au pré-diagnostic médical** pour agents de santé en zone à connectivité limitée. L'application fonctionne **hors ligne** (stockage local, catalogue médical en cache) et se **synchronise** avec un serveur central Django lorsque le réseau est disponible.

## Fonctionnalités

| Domaine | Description |
|---------|-------------|
| **Recherche symptômes** | Saisie libre → recherche floue (Fuse.js) sur un catalogue de maladies |
| **Scoring** | Score de correspondance symptômes / pathologie (filtrage ≥ 30 %) |
| **Alertes danger** | Détection de signes critiques (référentiel PCIME / OMS) avec consignes d'urgence |
| **Dossiers patients** | Enregistrement local des consultations (Dexie / IndexedDB) |
| **Historique** | Liste et détail des consultations sur l'appareil |
| **Authentification** | Inscription et connexion par code PIN (1 agent par appareil) |
| **Synchronisation** | Envoi des consultations vers l'API Django (JWT) |
| **PWA** | Installation sur mobile, mode hors ligne via Service Worker |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend PWA (React + Vite)                                │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Pages UI    │  │ Moteur       │  │ Dexie (IndexedDB)  │  │
│  │ Home,       │→ │ fuzzySearch  │  │ agents,            │  │
│  │ Results,    │  │ scorer       │  │ consultations      │  │
│  │ Patients…   │  │ dangerDetector│  └─────────┬──────────┘  │
│  └─────────────┘  └──────┬───────┘            │ sync (online)│
│                          │                    ▼              │
│                   public/data/*.json    syncService.js       │
│                   (catalogue médical)         │              │
└───────────────────────────────────────────────┼──────────────┘
                                                │ HTTP + JWT
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend Django REST (port 8000)                            │
│  agents (inscription, login) · consultations (sync batch) │
│  SQLite · Django Admin                                      │
└─────────────────────────────────────────────────────────────┘
```

## Technologies

### Frontend
- **React 18** + **React Router 6**
- **Vite 5** + **vite-plugin-pwa** (Service Worker injectManifest)
- **TailwindCSS 3**
- **Dexie 4** (IndexedDB)
- **Fuse.js 7** (recherche floue)
- **Tabler Icons React**

### Backend
- **Django 5** + **Django REST Framework**
- **djangorestframework-simplejwt** (authentification JWT)
- **django-cors-headers**
- **SQLite** (développement)

## Structure du projet

```
ProjetMedSearch/
├── src/
│   ├── api/
│   │   └── syncService.js       # Appels API (register, login, sync)
│   ├── components/              # UI réutilisable (Navbar, SearchBar, DangerAlert…)
│   ├── db/
│   │   └── database.js          # Schéma Dexie (agents, consultations)
│   ├── engine/
│   │   ├── fuzzySearch.js       # Recherche + lazy loading des catégories
│   │   ├── scorer.js            # Calcul du score symptômes / maladie
│   │   └── dangerDetector.js    # Détection signes de danger critiques
│   ├── hooks/
│   │   ├── useAuth.js           # Inscription, login PIN, tokens JWT
│   │   ├── useSync.js           # Synchronisation consultations → serveur
│   │   └── useOnlineStatus.js   # Détection connectivité
│   ├── pages/
│   │   ├── Home.jsx             # Accueil + saisie symptômes
│   │   ├── Results.jsx          # Résultats diagnostic + alertes
│   │   ├── Register.jsx / Login.jsx
│   │   ├── PatientForm.jsx      # Nouvelle consultation
│   │   ├── PatientList.jsx      # Historique local
│   │   └── PatientDetail.jsx    # Détail d'une consultation
│   ├── App.jsx                  # Routes et protection des pages
│   └── main.jsx
├── public/
│   ├── data/                    # Catalogue médical JSON (14 maladies)
│   ├── sw.js                    # Service Worker (cache offline)
│   └── manifest.json
├── backend/
│   ├── config/                  # settings, urls
│   ├── agents/                  # Modèle Agent, register, login JWT
│   └── consultations/           # Modèle Consultation, endpoint sync
├── requirements.txt             # Dépendances Python
├── package.json
└── vite.config.js
```

## Catalogue médical

Données statiques dans `public/data/` — **18 maladies** réparties en 5 catégories :

| Fichier | Contenu |
|---------|---------|
| `index.json` | Index des 18 maladies |
| `infectieuses.json` | Paludisme, Typhoïde, Méningite, Dengue… |
| `respiratoires.json` | Pneumonie, Tuberculose, Asthme, Otite… |
| `digestives.json` | Choléra, Diarrhée, Hépatite A, Helminthiases… |
| `nutritionnelles.json` | Malnutrition, Anémie |
| `dermatologiques.json` | Gale, Rougeole, Varicelle, Lèpre |

Chaque maladie contient : symptômes pondérés, signes de danger, prise en charge, niveau d'urgence.

## Routes de l'application

| Route | Page | Accès |
|-------|------|-------|
| `/login` | Inscription (1er lancement) ou connexion PIN | Public |
| `/` | Accueil — saisie des symptômes | Protégé |
| `/results?q=…` | Résultats de l'analyse | Protégé |
| `/patient/new` | Nouvelle consultation | Protégé |
| `/patients` | Historique des consultations | Protégé |
| `/patient/:id` | Détail d'une consultation | Protégé |
| `/sync/conflicts` | Résolution manuelle des conflits | Protégé |
| `/profile` | Profil agent (zone, sync, notifications) | Protégé |

## Mode hors-ligne avancé

### Background Sync (Service Worker)

Lorsqu'une consultation est enregistrée hors ligne, l'app planifie un tag `medsearch-sync-consultations` via l'API **Background Sync**. Dès que le réseau revient — même si l'app est fermée — le Service Worker envoie automatiquement les fiches en attente vers Django.

- Planification : `src/sync/backgroundSync.js`
- Logique partagée UI/SW : `src/sync/syncEngine.js`
- Fallback : sync automatique au retour réseau (`useAutoSyncOnReconnect`)

> **Note** : Background Sync est supporté surtout sur Chrome/Edge Android. Sur les navigateurs non compatibles, la sync se déclenche à la reconnexion ou via le bouton manuel.

### Notifications push

Après connexion, l'agent peut s'abonner aux alertes sanitaires. Le serveur central peut diffuser des messages par zone géographique (épidémies, consignes administratives).

### Gestion des conflits

Chaque consultation possède un `clientUuid` + `updatedAt` + `version`.

| Scénario | Comportement |
|----------|--------------|
| Version client plus récente | **Last-Write-Wins** — le serveur accepte la version locale |
| Version serveur plus récente | Conflit → page `/sync/conflicts` pour résolution manuelle |
| Même horodatage | Sync idempotente (déjà synchronisé) |

## Flux utilisateur

1. **Premier lancement** → Inscription de l'agent (nom, prénom, zone, email, PIN) — local + serveur si en ligne.
2. **Connexion** → Vérification du PIN (offline) ; renouvellement JWT si en ligne.
3. **Recherche** → Saisie des symptômes sur l'accueil → page résultats (scores + alertes danger).
4. **Consultation** → Création d'un dossier patient lié au diagnostic.
5. **Historique** → Consultation des fiches enregistrées localement.
6. **Synchronisation** → Envoi des fiches `statutSync: 'attente'` vers le serveur (nécessite connexion + token JWT valide).

## Installation et démarrage

### Prérequis
- **Node.js** 18+
- **Python** 3.10+

### Frontend

```bash
npm install
npm run dev
```

Application : `http://localhost:5173/` (ou le port indiqué par Vite).

### Partager l’app avec **n’importe quel téléphone** (WhatsApp, SMS…)

Une adresse du type `http://192.168.x.x:4174` ne fonctionne **que** sur le même Wi‑Fi que ton PC.  
Un autre téléphone (4G, autre box, autre pays) **ne peut pas** l’ouvrir.

| Méthode | Qui peut ouvrir ? | PC allumé ? |
|---------|-------------------|-------------|
| `http://192.168.x.x:4174` | Même Wi‑Fi uniquement | Oui |
| **Tunnel Internet** (`npm run share`) | **Tout téléphone avec Internet** | Oui |
| **Déploiement** (Netlify, serveur…) | Tout le monde, lien permanent | Non (hébergé) |

**Tunnel rapide (développement / démo) :**

```bash
# Terminal 1
npm run build
npm run preview:host

# Terminal 2
npm run share
```

Copie l’URL **`https://xxxx.trycloudflare.com`** affichée et envoie-la.  
Elle s’ouvre sur **n’importe quel téléphone**, partout.

> Pour la sync serveur via tunnel, expose aussi Django (`python manage.py runserver 0.0.0.0:8000`) avec un second tunnel, ou utilise l’app **hors ligne** (recherche + fiches locales sans API).

### Tester sur téléphone (réseau local — même Wi‑Fi)

1. PC et téléphone sur le **même Wi‑Fi**.
2. Lancer le frontend en mode réseau :
   ```bash
   npm run dev:mobile
   ```
3. Noter l’adresse **Network** affichée par Vite (ex. `http://192.168.1.42:5173/`).
4. Sur le téléphone, ouvrir cette URL dans **Chrome** (Android) ou **Safari** (iOS).
5. Backend Django : l’API doit être joignable depuis le téléphone. Si besoin, dans `.env` :
   ```
   VITE_API_URL=http://192.168.1.42:8000/api
   ```
   Puis lancer `python manage.py runserver 0.0.0.0:8000` dans `backend/`.
6. **Installer la PWA** : menu navigateur → « Ajouter à l’écran d’accueil » / « Installer l’application ».

> Pour une install hors-ligne complète en production : `npm run build` puis servir le dossier `dist/` en HTTPS.

```bash
npm run build    # Build production → dist/
npm run preview  # Prévisualiser le build
```

### Backend

```bash
# Depuis la racine du projet
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

API : `http://localhost:8000/`

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/` | GET | Statut API |
| `/api/agents/register/` | POST | Inscription agent |
| `/api/agents/login/` | POST | Connexion → tokens JWT |
| `/api/agents/profile/` | GET/PATCH | Profil agent (Bearer token) |
| `/api/agents/push/vapid-key/` | GET | Clé publique VAPID (push) |
| `/api/agents/push/subscribe/` | POST | Abonnement push agent (Bearer token) |
| `/api/agents/push/broadcast/` | POST | Diffusion alerte (admin Django) |
| `/api/consultations/sync/` | POST | Sync batch avec gestion conflits (Bearer token) |
| `/admin/` | GET | Interface Django Admin |

### Notifications push (VAPID)

Générer une paire de clés VAPID puis les exporter en variables d'environnement :

```bash
pip install cryptography
python backend/scripts/generate_vapid_keys.py
```

```bash
# Windows PowerShell
$env:VAPID_PUBLIC_KEY="..."
$env:VAPID_PRIVATE_KEY="..."
$env:VAPID_ADMIN_EMAIL="mailto:admin@medsearch.org"
```

Diffuser une alerte sanitaire (compte admin requis) :

```bash
curl -X POST http://localhost:8000/api/agents/push/broadcast/ \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Alerte épidémie\",\"body\":\"Cas de choléra signalés dans votre zone.\",\"zone\":\"Nord\"}"
```

### Configuration

- URL API frontend : copier `.env.example` → `.env` et définir `VITE_API_URL=http://localhost:8000/api`
- CORS : configuré dans `backend/config/settings.py` pour le dev local

## Design system

Interface **dark mode** médical — vert pour les actions positives, rouge réservé aux alertes critiques.

| Token | Valeur |
|-------|--------|
| Primary | `#1D9E75` |
| Background app | `#0D1117` |
| Background card | `#161D27` |
| Text primary | `#E8EDF3` |
| Danger | `#E53E3E` |
| Warning | `#EF9F27` |

- Police : **Inter** (fallback system-ui)
- Taille tactile minimum : **44×44 px**
- Pas de scroll horizontal sur mobile

## Stockage local (Dexie)

| Table | Champs principaux |
|-------|-------------------|
| `agents` | email, nom, prenom, zone, pin (hash SHA-256), syncToken, refreshToken |
| `consultations` | clientUuid, patientRef, updatedAt, version, statutSync (`attente` / `synced` / `conflit`) |
| `syncConflicts` | snapshots local/serveur en attente de résolution manuelle |

## État d'avancement

### Implémenté
- [x] Design system dark mode
- [x] Authentification agent (PIN, 1 appareil)
- [x] Moteur de recherche floue + scoring
- [x] Détection des signes de danger
- [x] Page résultats avec cartes diagnostic
- [x] CRUD consultations local (formulaire, liste, détail)
- [x] PWA + Service Worker + cache catalogue
- [x] API Django (agents, sync consultations, JWT)
- [x] Inscription / login connectés au backend (mode online)
- [x] Background Sync automatique (Service Worker)
- [x] Bouton sync manuel dans la Navbar
- [x] Notifications push (abonnement + diffusion admin)
- [x] Gestion conflits sync (LWW + résolution manuelle)
- [x] Page profil agent (zone, stats sync, notifications)

### En cours / à faire
- [ ] Enrichissement du catalogue médical (objectif 30+ pathologies)
- [ ] Tests unitaires (moteur, API, hooks, conflits)
- [ ] Configuration production (variables d'environnement, SECRET_KEY, VAPID)

## Limites connues

- Le catalogue est une **base de démonstration**, pas une référence clinique exhaustive.
- La synchronisation requiert une session JWT valide (reconnexion en ligne si expirée).
- Un seul agent par appareil (conception terrain).
- Background Sync non supporté sur tous les navigateurs (Safari iOS limité).
- Les clés VAPID doivent être générées et configurées pour activer le push en production.

## Licence

Projet privé.
