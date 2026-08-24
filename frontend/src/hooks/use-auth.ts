"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { LoginInput, RegisterInput, SellerApplicationInput } from "@/lib/validations";
import { User, normalizeUser } from "@/lib/auth";
import { uploadFiles } from "@/lib/upload";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

interface AuthResponse {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await apiClient.post("/auth/login", data);
      return unwrap<AuthResponse>(res);
    },
    onSuccess: (data) => {
      login(normalizeUser(data.user), data.tokens.accessToken, data.tokens.refreshToken);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await apiClient.post("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role.toUpperCase(),
      });
      return unwrap<AuthResponse>(res);
    },
    onSuccess: (data) => {
      login(normalizeUser(data.user), data.tokens.accessToken, data.tokens.refreshToken);
    },
  });
}

export interface SellerRegistrationFiles {
  idDocumentFile?: File | null;
  businessDocumentFiles?: File[];
}

export type SellerRegistrationInput = SellerApplicationInput & SellerRegistrationFiles;

export function useSellerRegistration() {
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SellerRegistrationInput) => {
      const res = await apiClient.post("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "SELLER",
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        businessPhone: data.businessPhone || undefined,
        produceTypes: data.produceTypes,
        businessRegistrationNumber: data.businessRegistrationNumber || undefined,
        idDocumentType: data.idDocumentType || undefined,
      });
      const auth = unwrap<AuthResponse>(res);

      login(normalizeUser(auth.user), auth.tokens.accessToken, auth.tokens.refreshToken);

      const profilePatch: Record<string, unknown> = {};

      if (data.idDocumentFile) {
        try {
          const docs = await uploadFiles([data.idDocumentFile], "/upload/kyc", "files");
          profilePatch.idDocument = docs[0].secure_url;
          profilePatch.idDocumentType = data.idDocumentType;
        } catch {
          // document upload is non-fatal; registration already succeeded
        }
      }

      if (data.businessDocumentFiles?.length) {
        try {
          const docs = await uploadFiles(data.businessDocumentFiles, "/upload/kyc", "files");
          profilePatch.businessDocuments = docs.map((d) => d.secure_url);
        } catch {
          // document upload is non-fatal; registration already succeeded
        }
      }

      if (Object.keys(profilePatch).length > 0) {
        await apiClient.put("/merchants/profile", profilePatch);
      }

      return auth;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post("/auth/logout");
      } catch {
        // ignore
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const { user, setLoading, updateUser } = useAuthStore();

  return {
    user,
    isLoading: useAuthStore((s) => s.isLoading),
    refetch: async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/users/profile");
        const profile = unwrap<any>(res);
        const normalized = normalizeUser(profile) as User;
        updateUser(normalized);
        return normalized;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
  };
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await apiClient.post("/auth/forgot-password", { email });
      return res.data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await apiClient.post("/auth/reset-password", data);
      return res.data;
    },
  });
}
