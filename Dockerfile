# --- Stage 1: build the frontend -------------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
# Vite is configured to output straight into backend/public
RUN npm run build

# --- Stage 2: backend runtime ------------------------------------------
FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install --omit=dev
COPY backend/ ./
# Bring in the built frontend from stage 1
COPY --from=frontend-build /app/backend/public ./public

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
