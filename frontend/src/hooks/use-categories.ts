"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: Array<{ id: string; name: string; slug: string; image?: string }>;
  _count?: { products: number };
}

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return unwrap<Category[]>(res);
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const res = await apiClient.get(`/categories/slug/${slug}`);
      return unwrap<Category>(res);
    },
    enabled: !!slug,
  });
}
