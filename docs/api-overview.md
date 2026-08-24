# AgroTech Marketplace API

## Base URL

| Environment | URL |
|------------|-----|
| Development | `http://localhost:4000/api/v1` |
| Production | `https://api.agrotech.ng/api/v1` |

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via `POST /auth/login` and refreshed via `POST /auth/refresh`.

### Token Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
  "expiresIn": 900
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    }
  ]
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — duplicate resource |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error |

---

## Endpoints

### Auth (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login with email & password |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Invalidate refresh token |
| GET | `/auth/verify-email/:token` | No | Verify email address |
| POST | `/auth/resend-verification` | Yes | Resend verification email |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password/:token` | No | Reset password |

**Example — Register:**

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "buyer@example.com",
  "phone": "+2348012345678",
  "password": "SecurePass123!",
  "firstName": "Chidi",
  "lastName": "Okonkwo"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "email": "buyer@example.com",
    "firstName": "Chidi",
    "lastName": "Okonkwo",
    "role": "BUYER"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Users (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | Yes | Get current user profile |
| PATCH | `/users/me` | Yes | Update profile |
| PATCH | `/users/me/password` | Yes | Change password |
| GET | `/users/me/addresses` | Yes | List user addresses |
| POST | `/users/me/addresses` | Yes | Add new address |
| PATCH | `/users/me/addresses/:id` | Yes | Update address |
| DELETE | `/users/me/addresses/:id` | Yes | Delete address |

---

### Merchants (`/merchants`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/merchants/register` | Yes | Register as merchant |
| GET | `/merchants/profile` | Yes | Get merchant profile |
| PATCH | `/merchants/profile` | Yes | Update merchant profile |
| POST | `/merchants/kyc` | Yes | Submit KYC documents |
| GET | `/merchants/:id` | No | Get public merchant info |
| GET | `/merchants` | No | List merchants (filtered) |

---

### Products (`/products`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | No | List products (paginated, filterable) |
| GET | `/products/:slug` | No | Get product by slug |
| POST | `/products` | Merchant | Create product |
| PATCH | `/products/:id` | Merchant | Update product |
| DELETE | `/products/:id` | Merchant | Delete product |
| GET | `/products/merchant/:merchantId` | No | Products by merchant |
| GET | `/products/search` | No | Full-text search |

**Example — List Products:**

```http
GET /api/v1/products?page=1&limit=20&category=fruits&sortBy=price&order=asc&minPrice=100&maxPrice=5000
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Fresh Tomatoes",
      "slug": "fresh-tomatoes",
      "description": "Locally sourced vine-ripened tomatoes",
      "price": 1500,
      "comparePrice": 1800,
      "unit": "kg",
      "images": ["https://res.cloudinary.com/..."],
      "tags": ["FRESH", "ORGANIC"],
      "status": "ACTIVE",
      "rating": 4.5,
      "reviewCount": 23,
      "merchant": {
        "id": "uuid",
        "businessName": "Green Valley Farms"
      },
      "category": {
        "id": "uuid",
        "name": "Vegetables",
        "slug": "vegetables"
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### Categories (`/categories`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | No | List all categories |
| GET | `/categories/:slug` | No | Get category with products |
| POST | `/categories` | Admin | Create category |
| PATCH | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

---

### Cart (`/cart`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cart` | Yes | Get cart contents |
| POST | `/cart` | Yes | Add item to cart |
| PATCH | `/cart/:productId` | Yes | Update item quantity |
| DELETE | `/cart/:productId` | Yes | Remove item from cart |
| DELETE | `/cart` | Yes | Clear cart |

---

### Orders (`/orders`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | Buyer | Create order from cart |
| GET | `/orders` | Yes | List user orders |
| GET | `/orders/:id` | Yes | Get order details |
| PATCH | `/orders/:id/cancel` | Buyer | Cancel order |
| PATCH | `/orders/:id/status` | Merchant | Update order status |
| GET | `/orders/merchant` | Merchant | List merchant orders |

**Example — Create Order:**

```http
POST /api/v1/orders
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "deliveryAddressId": "uuid",
  "note": "Leave at the gate please",
  "paymentMethod": "PAYSTACK"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "orderNumber": "AGT-20240730-001",
  "subtotal": 8500,
  "deliveryFee": 500,
  "total": 9000,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "paymentUrl": "https://paystack.com/pay/ref_xxx",
  "items": [
    {
      "productId": "uuid",
      "productName": "Fresh Tomatoes",
      "quantity": 3,
      "unitPrice": 1500,
      "totalPrice": 4500
    }
  ]
}
```

---

### Payments (`/payments`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/verify/:reference` | Yes | Verify payment |
| POST | `/payments/webhook/paystack` | No | Paystack webhook |
| POST | `/payments/webhook/flutterwave` | No | Flutterwave webhook |

---

### Reviews (`/reviews`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reviews/product/:productId` | No | List product reviews |
| POST | `/reviews` | Buyer | Create review |
| PATCH | `/reviews/:id` | Buyer | Update review |
| DELETE | `/reviews/:id` | Buyer | Delete review |

---

### Wishlist (`/wishlist`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/wishlist` | Yes | List wishlist items |
| POST | `/wishlist` | Yes | Add to wishlist |
| DELETE | `/wishlist/:productId` | Yes | Remove from wishlist |

---

### Chat (`/chat`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/chat/conversations` | Yes | List conversations |
| GET | `/chat/conversations/:userId` | Yes | Get messages with user |
| POST | `/chat/send` | Yes | Send message |

**WebSocket Events:**

| Event | Direction | Description |
|-------|-----------|-------------|
| `chat:join` | Client → Server | Join conversation room |
| `chat:message` | Bidirectional | Send/receive message |
| `chat:read` | Client → Server | Mark messages as read |
| `chat:typing` | Bidirectional | Typing indicator |

---

### Notifications (`/notifications`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Yes | List user notifications |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |

---

### Wallet (`/wallet`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/wallet` | Yes | Get wallet balance |
| GET | `/wallet/transactions` | Yes | List transactions |
| POST | `/wallet/fund` | Yes | Fund wallet |

---

### Delivery (`/delivery`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/delivery/order/:orderId` | Yes | Get delivery status |
| PATCH | `/delivery/location` | Rider | Update live location |
| PATCH | `/delivery/:id/status` | Rider | Update delivery status |

---

### Admin (`/admin`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Admin | List all users |
| PATCH | `/admin/users/:id/role` | Admin | Change user role |
| GET | `/admin/merchants` | Admin | List merchants |
| PATCH | `/admin/merchants/:id/status` | Admin | Approve/reject merchant |
| GET | `/admin/products` | Admin | List products |
| PATCH | `/admin/products/:id/status` | Admin | Approve/reject product |
| GET | `/admin/orders` | Admin | List all orders |
| GET | `/admin/stats` | Admin | Platform statistics |

---

### Upload (`/upload`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload/image` | Yes | Upload single image |
| POST | `/upload/images` | Yes | Upload multiple images |
| DELETE | `/upload/:publicId` | Yes | Delete uploaded image |

---

### Coupons (`/coupons`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/coupons` | Admin | Create coupon |
| GET | `/coupons` | Admin | List coupons |
| GET | `/coupons/validate/:code` | Yes | Validate and apply coupon |

---

### Analytics (`/analytics`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/revenue` | Merchant | Revenue analytics |
| GET | `/analytics/orders` | Merchant | Order analytics |
| GET | `/analytics/products` | Merchant | Top products |
| GET | `/analytics/platform` | Admin | Platform-wide analytics |
