"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useCartStore, CartItem } from "@/store/cart-store";

interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    unit: string;
    quantity: number;
    merchant?: { id: string; businessName: string };
  };
}

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

function getCartItemId(productId: string): string {
  const item = useCartStore.getState().items.find((i) => i.productId === productId);
  if (!item?.id) throw new Error("Cart item not found");
  return item.id;
}

export function useCart(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await apiClient.get("/cart");
      const data = unwrap<{ items: CartItemResponse[]; subtotal: number; itemCount: number }>(res);
      return data.items.map((item): CartItem => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images?.[0] || "",
        unit: item.product.unit,
        sellerId: item.product.merchant?.id || "",
        maxQuantity: item.product.quantity,
        quantity: item.quantity,
      }));
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      item,
    }: {
      productId: string;
      quantity?: number;
      item: Omit<CartItem, "quantity" | "id">;
    }) => {
      const res = await apiClient.post("/cart/items", { productId, quantity });
      const cartItem = unwrap<{ id: string; productId: string; quantity: number }>(res);
      return { cartItem, item };
    },
    onSuccess: ({ cartItem, item }) => {
      addItem({
        ...item,
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const removeItem = useCartStore((s) => s.removeItem);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const itemId = getCartItemId(productId);
      await apiClient.delete(`/cart/items/${itemId}`);
      return productId;
    },
    onSuccess: (productId) => {
      removeItem(productId);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartQuantity() {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const itemId = getCartItemId(productId);
      await apiClient.put(`/cart/items/${itemId}`, { quantity });
      return { productId, quantity };
    },
    onSuccess: ({ productId, quantity }) => {
      updateQuantity(productId, quantity);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const clearCart = useCartStore((s) => s.clearCart);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete("/cart");
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
