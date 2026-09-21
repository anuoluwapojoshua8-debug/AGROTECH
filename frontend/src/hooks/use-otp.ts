"use client";

import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async (data: { email?: string; phone?: string; channel: "email" | "sms" | "both" }) => {
      const res = await apiClient.post("/otp/send", data);
      return unwrap<{ message: string; expiresIn: number; preview?: any }>(res);
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (data: { email?: string; phone?: string; code: string; channel?: "email" | "sms" }) => {
      const res = await apiClient.post("/otp/verify", data);
      return unwrap<{ message: string; verified: boolean }>(res);
    },
  });
}
