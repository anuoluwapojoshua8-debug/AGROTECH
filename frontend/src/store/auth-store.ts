import { create } from "zustand";
import { User, normalizeUser, setTokens, setUser, clearAuth, getToken, getUser } from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: (user, accessToken, refreshToken) => {
    const normalized = normalizeUser(user);
    setTokens(accessToken, refreshToken);
    setUser(normalized);
    set({
      user: normalized,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    clearAuth();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateUser: (user) => {
    const normalized = normalizeUser(user);
    setUser(normalized);
    set({ user: normalized });
  },

  setLoading: (isLoading) => set({ isLoading }),

  initialize: () => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      set({
        user: normalizeUser(user),
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
