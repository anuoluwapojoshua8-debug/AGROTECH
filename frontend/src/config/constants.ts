export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const API_ORIGIN = API_URL.replace(/\/api(\/v1)?\/?$/, "");

export const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "agrotech_token";
export const REFRESH_TOKEN_KEY = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "agrotech_refresh_token";
export const USER_KEY = "agrotech_user";

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const PRODUCT_TAGS = ["Fresh", "Organic", "Frozen", "Premium", "Local"] as const;

export const ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

export const ITEMS_PER_PAGE = 12;
