# AgroTech Marketplace — Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  Next.js Frontend │  │  Mobile App (Future)             │ │
│  │  :3000            │  │  React Native                    │ │
│  └────────┬─────────┘  └────────┬─────────────────────────┘ │
└───────────┼──────────────────────┼───────────────────────────┘
            │ HTTP/WS              │ HTTP/WS
┌───────────┼──────────────────────┼───────────────────────────┐
│           └────────┬─────────────┘                           │
│                    ▼                                         │
│           ┌──────────────────┐                               │
│           │   Nginx (Proxy)  │                               │
│           │   :3000          │                               │
│           └────────┬─────────┘                               │
│                    │ /api, /socket.io                        │
│           ┌────────▼─────────┐    ┌──────────────────┐       │
│           │  NestJS Backend  │◄──►│    PostgreSQL     │       │
│           │  :4000           │    │    :5432          │       │
│           │  Rest API + WS   │    └──────────────────┘       │
│           │                  │    ┌──────────────────┐       │
│           │                  │◄──►│      Redis       │       │
│           │                  │    │    :6379         │       │
│           └──────────────────┘    └──────────────────┘       │
│                      │                                        │
│           ┌──────────┼──────────┐                             │
│           ▼          ▼          ▼                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│  │ Paystack │ │Flutterwave│ │Cloudinary│                      │
│  └──────────┘ └──────────┘ └──────────┘                      │
└─────────────────────────────── Service Layer ────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server-side rendered React app |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **State** | Zustand + React Query | Client & server state management |
| **Backend** | NestJS 10 | Modular Node.js framework |
| **API** | REST + WebSocket | Data & real-time messaging |
| **ORM** | Prisma ORM | Type-safe database access |
| **Database** | PostgreSQL 16 | Primary data store |
| **Cache** | Redis 7 | Session store, queue, cache |
| **Queue** | Bull + Redis | Background job processing |
| **Auth** | JWT + Passport | Access & refresh tokens |
| **Payments** | Paystack + Flutterwave | Nigerian payment gateways |
| **File Storage** | Cloudinary | Image upload & optimization |
| **SMS** | Twilio | Phone verification |
| **Email** | SendGrid | Transactional emails |
| **Container** | Docker | Development & deployment |
| **CI/CD** | GitHub Actions | Automated pipelines |

## Folder Structure

```
agrotech/
├── backend/
│   ├── prisma/              # Schema & migrations
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── common/           # Shared guards, interceptors, filters
│       ├── config/           # Configuration modules
│       ├── database/         # Prisma service & DB module
│       ├── modules/          # Feature modules (20)
│       │   ├── auth/         # Login, register, refresh, logout
│       │   ├── users/        # User profile & management
│       │   ├── merchants/    # Merchant registration & KYC
│       │   ├── products/     # Product CRUD & search
│       │   ├── categories/   # Category tree
│       │   ├── cart/         # Shopping cart
│       │   ├── orders/       # Order lifecycle
│       │   ├── payments/     # Payment gateway integration
│       │   ├── delivery/     # Delivery tracking
│       │   ├── reviews/      # Product reviews & ratings
│       │   ├── wishlist/     # User wishlist
│       │   ├── wallet/       # Digital wallet
│       │   ├── coupons/      # Discount coupons
│       │   ├── referrals/    # Referral system
│       │   ├── chat/         # Buyer-merchant messaging
│       │   ├── notifications/# Push & in-app notifications
│       │   ├── upload/       # File upload to Cloudinary
│       │   ├── admin/        # Admin dashboard APIs
│       │   ├── dashboard/    # Seller dashboard analytics
│       │   └── analytics/    # Platform analytics
│       └── websockets/       # Gateway setup
├── frontend/                 # Next.js application
├── packages/
│   └── shared/               # Shared types & constants
├── docker/                   # Dockerfiles & nginx config
├── docs/                     # Documentation
└── .github/workflows/        # CI/CD pipelines
```

## Data Flow

### Product Browsing
```
User → Next.js → API Route → NestJS → Prisma → PostgreSQL
                                    ↕
                                Redis (cache)
```

### Order Placement
```
User → Next.js → POST /orders → NestJS → Validate stock → Create order
       → Initiate payment → Payment Gateway → Webhook → Update status
       → Queue delivery assignment → Notification → Real-time update via WS
```

### Real-time Chat
```
User A → Socket.IO → NestJS Gateway → Redis Pub/Sub → NestJS Gateway → User B
                                    ↕
                              PostgreSQL (persist)
```

## Key Design Decisions

1. **NestJS over Express** — Opinionated architecture with modules, DI, guards, interceptors; scales better for a marketplace with 20+ modules.

2. **Prisma over TypeORM** — Type-safe queries, auto-generated types, simpler migrations, excellent PostgreSQL support.

3. **Monorepo with npm workspaces** — Shared types between backend and frontend in `packages/shared`; single `node_modules`.

4. **JWT with refresh tokens** — Short-lived access tokens (15 min) with rotating refresh tokens (7 days) for security.

5. **Bull queues for async tasks** — Email sending, SMS, notification dispatch, and payment confirmation processed asynchronously via Redis-backed queues.

6. **WebSocket for chat & delivery tracking** — Real-time buyer-merchant messaging and live delivery location updates.

7. **Multi-payment gateway** — Paystack primary, Flutterwave fallback; both support NGN, major Nigerian payment methods (card, transfer, USSD).

8. **Swagger/OpenAPI** — Auto-generated API docs at `/docs` endpoint from NestJS decorators.

9. **Feature-based module structure** — Each domain feature is self-contained with its own controller, service, DTOs, and tests.
