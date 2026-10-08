# ---- 1. Build du frontend Angular ----
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY frontend/ ./
RUN npm run build

# ---- 2. Build du backend NestJS ----
FROM node:22-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

# ---- 3. Image d'exécution : l'API Nest sert aussi le build Angular (public/) ----
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=backend /app/backend/node_modules ./node_modules
COPY --from=backend /app/backend/dist ./dist
COPY --from=backend /app/backend/package.json ./package.json
COPY --from=frontend /app/frontend/dist/frontend/browser ./public
USER node
EXPOSE 3000
# Render injecte PORT ; la valeur par défaut de l'appli est 3000
CMD ["node", "dist/main"]
