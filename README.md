# club-foot

Petite application d'inscription des enfants au club de foot : une page Angular qui envoie le formulaire à une API Spring Boot, stocké dans PostgreSQL (schéma géré par Liquibase).

| Couche | Techno |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Data JPA, Liquibase, Maven |
| Base de données | PostgreSQL 16 |
| Frontend | Angular 21 (formulaire réactif, tests Vitest) |
| CI | GitHub Actions |
| Hébergement | Render (un service web Docker + une base PostgreSQL) |

## Structure

```
backend/    API Spring Boot (POST /api/inscriptions)
frontend/   Application Angular (une page d'inscription)
Dockerfile  Build complet : Angular -> embarqué dans le jar Spring Boot
render.yaml Blueprint Render (service web + base)
.github/workflows/ci.yml  Build, tests, déploiement
```

En production, Spring Boot sert directement le build Angular : une seule URL, pas de CORS.

## Lancer en local

```bash
# 1. Base PostgreSQL
docker compose up -d db

# 2. Backend (http://localhost:8080)
cd backend && mvn spring-boot:run

# 3. Frontend (http://localhost:4200, /api est proxifié vers le backend)
cd frontend && npm install && npm start
```

Tests :

```bash
cd backend && mvn verify          # nécessite le PostgreSQL du docker compose
cd frontend && npm test -- --no-watch
```

Le backend lit `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (valeurs par défaut = docker compose).

## CI / déploiement

À chaque `push` et `pull_request`, le workflow compile le backend, exécute ses tests contre un PostgreSQL, teste et compile Angular, puis vérifie que l'image Docker se construit. Sur `main`, si tout est vert, il déclenche le déploiement Render.

Mise en place (une seule fois) :

1. Sur Render : **New > Blueprint**, choisir ce dépôt (il lit `render.yaml` et crée le service et la base).
2. Dans le service Render : **Settings > Deploy Hook**, copier l'URL.
3. Sur GitHub : **Settings > Secrets and variables > Actions > New repository secret** `RENDER_DEPLOY_HOOK_URL` = cette URL.

Conseil : après un premier `npm install` dans `frontend/`, commiter `package-lock.json` (la CI et le Dockerfile utilisent alors `npm ci`).

## Données personnelles

L'application collecte des données concernant des mineurs et leurs parents. L'API n'expose volontairement aucun endpoint de lecture. Avant une mise en production réelle, prévoir l'information RGPD des familles et un accès sécurisé pour consulter les inscriptions.
