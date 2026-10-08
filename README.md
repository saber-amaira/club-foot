# club-foot

Application d'inscription des enfants au club de foot, avec trois pages :

- **Accueil** : présentation du club, étapes, catégories.
- **Inscription** : formulaire (enfant + parent). La catégorie (U7 à U17) est calculée à partir de l'âge.
- **Inscrits** : liste des inscrits avec recherche et filtre par catégorie, **protégée par une clé du club** (elle contient des coordonnées de parents).

| Couche | Techno |
|---|---|
| Frontend | Angular 21 (routing, formulaires réactifs, tests Vitest) |
| Backend | NestJS 11, TypeORM, class-validator |
| Base de données | PostgreSQL 16 (migrations TypeORM appliquées au démarrage) |
| CI | GitHub Actions |
| Hébergement | Render (service web Docker + base PostgreSQL), déploiement automatique |

## Structure

```
frontend/   Application Angular
backend/    API NestJS : POST /api/inscriptions, GET /api/inscriptions (clé requise), GET /api/health
Dockerfile  Build complet : Angular est embarqué dans l'image du backend (une seule URL, pas de CORS)
render.yaml Blueprint Render (service web + base)
.github/workflows/ci.yml  Build et tests
```

## Lancer en local

```bash
# 1. Base PostgreSQL
docker compose up -d db

# 2. Backend (http://localhost:3000)
cd backend
cp .env.example .env        # ADMIN_KEY=admin par défaut en local
npm install
npm run start:dev

# 3. Frontend (http://localhost:4200, /api est proxifié vers le backend)
cd frontend
npm install
npm start
```

Tests :

```bash
cd backend && npm test                     # nécessite le PostgreSQL du docker compose
cd frontend && npm test -- --no-watch
```

Conseil : après le premier `npm install`, commiter `backend/package-lock.json` et `frontend/package-lock.json` (la CI et le Dockerfile passent alors à `npm ci`, plus rapide et reproductible).

## CI/CD

À chaque `push` et `pull_request`, GitHub Actions compile et teste le backend (contre un vrai PostgreSQL), teste et compile Angular, puis vérifie que l'image Docker se construit.

Le déploiement est automatique : `render.yaml` utilise `autoDeployTrigger: checksPass`, donc Render redéploie la branche `main` dès que ces vérifications sont au vert, et jamais si elles échouent.

Mise en place (une seule fois) : sur Render, **New > Blueprint**, choisir ce dépôt. Render crée la base et le service à partir de `render.yaml`. La clé de la page « Inscrits » (`ADMIN_KEY`) est générée par Render : la lire dans **Environment** du service.

## Données personnelles

L'application collecte des données concernant des mineurs et leurs parents. Le formulaire d'inscription est public, la lecture est réservée à la clé du club. Avant une vraie mise en service, prévoir l'information RGPD des familles et un mode d'accès plus fin que la clé partagée (comptes nominatifs, par exemple).
