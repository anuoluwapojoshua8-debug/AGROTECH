"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface BuyerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export function useBuyerProfile() {
  return useQuery({
    queryKey: ["buyer-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/users/profile");
      return unwrap<BuyerProfile>(res);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; phone?: string }) => {
      const res = await apiClient.put("/users/profile", data);
      return unwrap<BuyerProfile>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiClient.put("/users/password", data);
      return unwrap<any>(res);
    },
  });
}
