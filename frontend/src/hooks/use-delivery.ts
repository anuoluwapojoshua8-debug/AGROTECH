"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface Delivery {
  id: string;
  orderId: string;
  riderId?: string;
  status: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  currentLat?: number;
  currentLng?: number;
  startedAt?: string;
  completedAt?: string;
  proofImage?: string;
  order?: { orderNumber: string; status: string; deliveryAddress: string; buyer?: any };
}

export function useDeliveryByOrder(orderId: string) {
  return useQuery({
    queryKey: ["delivery", orderId],
    queryFn: async () => {
      const res = await apiClient.get(`/delivery/${orderId}`);
      return unwrap<Delivery>(res);
    },
    enabled: !!orderId,
  });
}

export function useRiderDeliveries(page = 1, status?: string) {
  return useQuery({
    queryKey: ["rider-deliveries", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "all") params.set("status", status);
      const res = await apiClient.get(`/delivery/rider/my-deliveries?${params}`);
      return unwrap<{ items: Delivery[]; meta: any }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function usePendingDeliveries(page = 1) {
  return useQuery({
    queryKey: ["pending-deliveries", page],
    queryFn: async () => {
      const res = await apiClient.get(`/delivery/pending/list?page=${page}&limit=20`);
      return unwrap<{ items: Delivery[]; meta: any }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useAssignRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, riderId }: { orderId: string; riderId: string }) => {
      const res = await apiClient.post(`/delivery/${orderId}/assign`, { riderId });
      return unwrap<Delivery>(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-deliveries"] });
      qc.invalidateQueries({ queryKey: ["delivery"] });
    },
  });
}

export function useStartDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiClient.put(`/delivery/${orderId}/start`);
      return unwrap<Delivery>(res);
    },
    onSuccess: (_d, orderId) => {
      qc.invalidateQueries({ queryKey: ["rider-deliveries"] });
      qc.invalidateQueries({ queryKey: ["delivery", orderId] });
    },
  });
}

export function useUpdateDeliveryLocation() {
  return useMutation({
    mutationFn: async ({ orderId, lat, lng }: { orderId: string; lat: number; lng: number }) => {
      const res = await apiClient.put(`/delivery/${orderId}/location`, { lat, lng });
      return unwrap<Delivery>(res);
    },
  });
}

export function useMarkDelivered() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, proofImage }: { orderId: string; proofImage?: string }) => {
      const res = await apiClient.put(`/delivery/${orderId}/deliver`, { proofImage });
      return unwrap<Delivery>(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rider-deliveries"] });
      qc.invalidateQueries({ queryKey: ["delivery"] });
    },
  });
}
