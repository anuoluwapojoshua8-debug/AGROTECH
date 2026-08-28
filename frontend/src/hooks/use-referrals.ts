"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export function useReferralCode() {
  return useQuery({
    queryKey: ["referral-code"],
    queryFn: async () => {
      const res = await apiClient.get("/referrals/code");
      return unwrap<{ code: string | null }>(res);
    },
  });
}

export function useGenerateReferralCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/referrals/code/generate");
      return unwrap<{ code: string }>(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referral-code"] }),
  });
}

export function useApplyReferral() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiClient.post("/referrals/apply", { code });
      return unwrap<any>(res);
    },
  });
}

export function useMyReferrals(page = 1) {
  return useQuery({
    queryKey: ["my-referrals", page],
    queryFn: async () => {
      const res = await apiClient.get(`/referrals?page=${page}&limit=20`);
      return unwrap<{ items: any[]; totalRewards: number; meta: any }>(res);
    },
  });
}

export function useReferralStats() {
  return useQuery({
    queryKey: ["referral-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/referrals/stats");
      return unwrap<{ totalReferrals: number; completedReferrals: number; pendingReferrals: number; totalEarned: number; rewardPerReferral: number }>(res);
    },
  });
}
