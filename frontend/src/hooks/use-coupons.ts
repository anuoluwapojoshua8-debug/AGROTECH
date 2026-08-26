"use client";

import { useMutation } from "@tanstack/react-query";
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

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: { code: string; orderAmount: number }) => {
      const res = await apiClient.post("/coupons/validate", { code, orderAmount });
      return unwrap<CouponValidation>(res);
    },
  });
}
