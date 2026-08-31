"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/overview");
      return unwrap<any>(res);
    },
  });
}

export function useRevenueAnalytics(period: "daily" | "weekly" | "monthly" = "monthly") {
  return useQuery({
    queryKey: ["analytics-revenue", period],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/revenue?period=${period}&limit=12`);
      return unwrap<any[]>(res);
    },
  });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["analytics-top-products", limit],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/top-products?limit=${limit}`);
      return unwrap<any[]>(res);
    },
  });
}

export function useCategoryPerformance() {
  return useQuery({
    queryKey: ["analytics-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/categories");
      return unwrap<any[]>(res);
    },
  });
}
