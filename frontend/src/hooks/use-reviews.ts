"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; avatar?: string };
  product?: { id: string; name: string; slug: string; images: string[] };
}

export function useProductReviews(productId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["product-reviews", productId, page],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
      return unwrap<{ items: Review[]; meta: any; ratingSummary: { average: number; total: number } }>(res);
    },
    enabled: !!productId,
    placeholderData: keepPreviousData,
  });
}

export function useMyReviews(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["my-reviews", page],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/my-reviews?page=${page}&limit=${limit}`);
      return unwrap<{ items: Review[]; meta: any }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; orderId: string; rating: number; comment?: string; images?: string[] }) => {
      const res = await apiClient.post("/reviews", data);
      return unwrap<Review>(res);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", vars.productId] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/reviews/${id}`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });
}
