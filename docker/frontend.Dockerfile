FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json .npmrc ./
COPY packages/shared ./packages/shared
COPY frontend ./frontend

RUN npm ci
RUN npm run build:shared

ENV NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
RUN npm run build -w frontend

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

EXPOSE 3000

CMD ["node", "frontend/server.js"]
