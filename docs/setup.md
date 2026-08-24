# AgroTech Marketplace — Setup Guide

## Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **PostgreSQL** 16 (optional if using Docker)
- **Redis** 7 (optional if using Docker)
- **Docker Desktop** (optional, for containerized setup)

## Environment Variables

Copy the example environment file and fill in your values:

```bash
cp backend/.env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Backend port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/agrotech` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `PAYSTACK_SECRET_KEY` | Paystack API secret | (required for payments) |
| `PAYSTACK_PUBLIC_KEY` | Paystack API public key | (required for payments) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | (required for uploads) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | (required for uploads) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | (required for uploads) |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/agrotech.git
cd agrotech

# Install all dependencies (workspaces)
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (admin user, categories, sample products)
npm run db:seed
```

## Running Locally with Docker

```bash
# Start all services
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate deploy --schema=backend/prisma/schema.prisma

# Seed the database
docker compose exec backend npx ts-node backend/prisma/seed.ts
```

Access the services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| API Docs (Swagger) | http://localhost:4000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Running Locally without Docker

### 1. Start PostgreSQL & Redis

Ensure PostgreSQL 16 and Redis 7 are running on your machine. Update `.env` with your local connection strings.

### 2. Start the Backend

```bash
# Terminal 1 — Backend (watch mode)
npm run dev:backend
```

The backend starts at http://localhost:4000. Swagger docs at http://localhost:4000/docs.

### 3. Start the Frontend

```bash
# Terminal 2 — Frontend (watch mode)
npm run dev:frontend
```

The frontend starts at http://localhost:3000.

### 4. Start both together

```bash
npm run dev
```

## Database Migrations

```bash
# Create a new migration after schema changes
npm run db:migrate -- --name describe_your_change

# Apply pending migrations in production
npm run db:migrate:prod   # equivalent to: npx prisma migrate deploy
```

## Seeding

The seed script creates: admin user, buyers, merchants, categories, and sample products.

```bash
# Run seed
npm run db:seed

# Reset database and re-seed
npx prisma migrate reset --schema=backend/prisma/schema.prisma --force
npm run db:seed
```

## Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e -w backend

# Run with coverage
npm test -- --coverage
```

## Linting & Formatting

```bash
# Lint both backend and frontend
npm run lint

# Format code
npm run format
```
