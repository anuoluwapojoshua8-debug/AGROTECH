"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: { id: string; name: string; slug: string };
  merchant: { id: string; businessName: string; businessLogo?: string };
  quantity: number;
  unit: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  deliveryTime?: string;
  origin?: string;
  isOrganic: boolean;
  isFresh: boolean;
  isFrozen: boolean;
  status: string;
  slug: string;
  createdAt: string;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: { id: string; firstName?: string; lastName?: string; avatar?: string };
  }>;
}

export interface ProductsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductsResponse {
  items: Product[];
  meta: ProductsMeta;
}

interface ProductsFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

const SORT_MAP: Record<string, { sortBy: string; sortOrder: "asc" | "desc" }> = {
  popular: { sortBy: "rating", sortOrder: "desc" },
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  "price-asc": { sortBy: "price", sortOrder: "asc" },
  "price-desc": { sortBy: "price", sortOrder: "desc" },
  rating: { sortBy: "rating", sortOrder: "desc" },
};

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export function useProducts(filters: ProductsFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.search) params.set("search", filters.search);
      if (filters.minPrice !== undefined && filters.minPrice > 0)
        params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice !== undefined && filters.maxPrice > 0)
        params.set("maxPrice", String(filters.maxPrice));
      if (filters.sort && SORT_MAP[filters.sort]) {
        params.set("sortBy", SORT_MAP[filters.sort].sortBy);
        params.set("sortOrder", SORT_MAP[filters.sort].sortOrder);
      }
      const res = await apiClient.get(`/products?${params}`);
      return unwrap<ProductsResponse>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${slug}`);
      return unwrap<Product>(res);
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const res = await apiClient.get("/products/featured");
      return unwrap<Product[]>(res);
    },
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: async () => {
      const res = await apiClient.get("/products/best-sellers");
      return unwrap<Product[]>(res);
    },
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: ["products", "related", productId],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${productId}/related`);
      return unwrap<Product[]>(res);
    },
    enabled: !!productId,
  });
}

export function useSearchProducts(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      const res = await apiClient.get(`/products/search?search=${encodeURIComponent(query)}`);
      const data = unwrap<ProductsResponse>(res);
      return data.items;
    },
    enabled: options?.enabled ?? query.length >= 2,
  });
}
