FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Compile the migrate script to plain JS so the runner doesn't need tsx
RUN node_modules/.bin/esbuild scripts/migrate.ts \
      --bundle --platform=node --target=node20 \
      --external:better-sqlite3 \
      --outfile=scripts/migrate.js

FROM base AS runner
ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/munny.db

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts/migrate.js ./scripts/migrate.js
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/db ./db

EXPOSE 3000

CMD ["sh", "-c", "node scripts/migrate.js && npm start -- --hostname 0.0.0.0"]

