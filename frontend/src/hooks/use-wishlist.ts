"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Product } from "./use-products";

interface WishlistItemResponse {
  id: string;
  productId: string;
  product: Product;
}

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export function useWishlist(enabled = true) {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await apiClient.get("/wishlist");
      const data = unwrap<WishlistItemResponse[]>(res);
      return data.map((item) => item.product);
    },
    enabled,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const checkRes = await apiClient.get(`/wishlist/check/${productId}`);
      const check = unwrap<{ isInWishlist: boolean }>(checkRes);

      if (check.isInWishlist) {
        await apiClient.delete(`/wishlist/${productId}`);
      } else {
        await apiClient.post(`/wishlist/${productId}`);
      }
      return { productId, added: !check.isInWishlist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}
