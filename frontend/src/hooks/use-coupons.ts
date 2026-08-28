"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: { code: string; orderAmount: number }) => {
      const res = await apiClient.post("/coupons/validate", { code, orderAmount });
      const raw = unwrap<any>(res);
      // Backend returns { valid, coupon, discount } – normalize to CouponValidation
      if (raw.coupon) {
        return {
          valid: raw.valid ?? true,
          code: raw.coupon.code,
          discountType: raw.coupon.discountType,
          discountValue: raw.coupon.discountValue,
          discountAmount: raw.discount ?? raw.discountAmount ?? 0,
          minOrderAmount: raw.coupon.minOrderAmount,
          maxDiscountAmount: raw.coupon.maxDiscount,
        } as CouponValidation;
      }
      return raw as CouponValidation;
    },
  });
}

export function useAdminCoupons(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin-coupons", page],
    queryFn: async () => {
      const res = await apiClient.get(`/coupons?page=${page}&limit=${limit}`);
      return unwrap<{ items: AdminCoupon[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminCoupon> & { code: string; discountType: string; discountValue: number }) => {
      const res = await apiClient.post("/coupons", data);
      return unwrap<AdminCoupon>(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.put(`/coupons/${id}`, data);
      return unwrap<AdminCoupon>(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/coupons/${id}`);
      return unwrap<any>(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}
