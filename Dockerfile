# ---- 1. Build du frontend Angular ----
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY frontend/ ./
RUN npm run build

# ---- 2. Build du backend Spring Boot (frontend embarqué dans static/) ----
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn -B -ntp -q dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /app/frontend/dist/frontend/browser/ ./src/main/resources/static/
RUN mvn -B -ntp -q -DskipTests package

# ---- 3. Image d'exécution ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 10001 appuser
COPY --from=backend /app/backend/target/*.jar app.jar
USER appuser
EXPOSE 8080
# Render injecte PORT ; MaxRAMPercentage garde de la marge sur les petites instances
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
