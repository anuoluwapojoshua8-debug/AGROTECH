import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/config/constants";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "admin";
  avatar?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isSuspended?: boolean;
  createdAt?: string;
}

export function normalizeRole(role?: string): User["role"] {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "admin";
    case "SELLER":
      return "seller";
    default:
      return "buyer";
  }
}

export function normalizeUser(user: any): User {
  if (!user) return user;
  return { ...user, role: normalizeRole(user.role) };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hasRole(role: string): boolean {
  const user = getUser();
  return user?.role === role;
}

export function isAdmin(): boolean {
  return hasRole("admin");
}

export function isSeller(): boolean {
  return hasRole("seller");
}

export function isBuyer(): boolean {
  return hasRole("buyer");
}
