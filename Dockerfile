# --- 1-bosqich: paketlar ---
FROM node:22-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- 2-bosqich: yig'ish ---
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Yig'ish paytida haqiqiy baza kerak emas, lekin o'zgaruvchi bo'lishi kerak —
# aks holda Prisma mijozi yaratilayotganda xato beradi. Ishlaganda
# docker compose haqiqiy qiymatni beradi.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV SESSION_SECRET="faqat-yigish-uchun-kamida-32-belgi-boladigan-satr"

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# --- 3-bosqich: ishlaydigan image ---
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Migratsiya konteyner ichida ishlashi uchun
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Platforma egasini yaratish skripti serverda ham kerak
COPY --from=builder /app/scripts ./scripts

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
