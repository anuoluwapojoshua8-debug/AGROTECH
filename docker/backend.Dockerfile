FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json tsconfig.base.json .npmrc ./
COPY packages/shared ./packages/shared
COPY backend ./backend

RUN npm ci

RUN npm run build:shared
RUN npx prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build -w backend

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/shared ./packages/shared

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

CMD ["node", "backend/dist/main"]
