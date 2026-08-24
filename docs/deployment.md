# AgroTech Marketplace — Deployment Guide

## Overview

- **Backend**: Deployed on Railway (Node.js container)
- **Frontend**: Deployed on Vercel (Next.js)
- **Database**: Railway-managed PostgreSQL
- **Cache**: Railway Redis add-on
- **File Storage**: Cloudinary
- **Payments**: Paystack / Flutterwave
- **CI/CD**: GitHub Actions (automatic on push to `main`)

---

## Deploying Backend to Railway

### 1. Prerequisites

- Railway account (railway.app)
- Railway CLI installed: `npm i -g @railway/cli`

### 2. Steps

```bash
# Login to Railway
railway login

# Link your project
railway link

# Deploy
railway up

# Run migrations
railway run npx prisma migrate deploy --schema=backend/prisma/schema.prisma

# Seed database
railway run npx ts-node backend/prisma/seed.ts
```

### 3. Railway Environment Variables

Set these in the Railway dashboard under your project → Variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Railway PostgreSQL connection string |
| `REDIS_URL` | Railway Redis connection string |
| `JWT_SECRET` | (generate a strong random string) |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_SECRET` | (generate a strong random string) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `PAYSTACK_SECRET_KEY` | Live Paystack secret key |
| `PAYSTACK_PUBLIC_KEY` | Live Paystack public key |
| `FLUTTERWAVE_SECRET_KEY` | Live Flutterwave secret key |
| `FLUTTERWAVE_PUBLIC_KEY` | Live Flutterwave public key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio sender number |
| `SMTP_HOST` | `smtp.sendgrid.net` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `apikey` |
| `SMTP_PASS` | SendGrid API key |
| `EMAIL_FROM` | `noreply@agrotech.ng` |
| `FRONTEND_URL` | `https://agrotech.vercel.app` |

---

## Deploying Frontend to Vercel

### 1. Prerequisites

- Vercel account (vercel.com)
- Vercel CLI: `npm i -g vercel`

### 2. Steps

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Vercel Environment Variables

Set these in the Vercel dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.agrotech.ng/api/v1` |

### 4. Vercel Configuration

The `frontend/vercel.json` should be configured (create if not present):

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci"
}
```

---

## Database Migration in Production

After deploying the backend, run migrations manually or via CI/CD:

```bash
# Via Railway CLI
railway run npx prisma migrate deploy --schema=backend/prisma/schema.prisma

# Via Railway dashboard — open a shell and run:
npx prisma migrate deploy
```

**Important**: Never run `prisma migrate dev` in production. Always use `prisma migrate deploy` for production migrations.

---

## CI/CD Pipeline

### Workflows

Push to `main` triggers two workflows:

1. **CI** (`ci.yml`) — Runs on every push and PR to `main`:
   - Lint (ESLint)
   - Test (Jest with PostgreSQL service container)
   - Build (shared packages, backend, frontend)

2. **Deploy** (`deploy.yml`) — Runs on push to `main`:
   - Builds and deploys backend to Railway
   - Runs database migrations
   - Builds and deploys frontend to Vercel

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `RAILWAY_TOKEN` | Railway deployment token |
| `PRODUCTION_DATABASE_URL` | Production PostgreSQL URL (for migrations) |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `NEXT_PUBLIC_API_URL` | Production API URL |

### Obtaining Secrets

**Railway Token:**
```
Railway Dashboard → Settings → Tokens → Generate New Token
```

**Vercel Token:**
```
Vercel Dashboard → Settings → Tokens → Create
```

**Vercel IDs:**
```bash
vercel link
vercel project ls   # Shows project IDs
cat .vercel/project.json  # Contains orgId and projectId
```

---

## Manual Deployment Commands

### Backend

```bash
# Build
npm run build -w backend

# Start production server
NODE_ENV=production node backend/dist/main
```

### Frontend

```bash
# Build
npm run build -w frontend

# Start production server (standalone mode)
node frontend/.next/standalone/server.js
```

---

## Health Checks

After deployment, verify:

- **API Health**: `GET https://api.agrotech.ng/api/v1/health` → `200 OK`
- **Swagger Docs**: `https://api.agrotech.ng/docs`
- **Frontend**: `https://agrotech.vercel.app`

---

## Monitoring & Logging

- **Railway**: Built-in logging under each service's dashboard
- **Vercel**: Analytics, speed insights, and function logs
- **Database**: Railway provides PostgreSQL monitoring (CPU, memory, connections)
