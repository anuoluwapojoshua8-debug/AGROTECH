"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  merchant?: { id: string; businessName: string };
}

interface OrdersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export function useOrders(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["orders", page],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/my-orders?page=${page}&limit=${limit}`);
      const data = unwrap<{ items: Order[]; meta: OrdersMeta }>(res);
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/${id}`);
      return unwrap<Order>(res);
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      deliveryAddress: string;
      note?: string;
      paymentMethod?: string;
      couponCode?: string;
      deliveryLat?: number;
      deliveryLng?: number;
    }) => {
      const res = await apiClient.post("/orders", orderData);
      return unwrap<Order>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const res = await apiClient.put(`/orders/${orderId}/status`, { status });
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
