"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface SellerDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  pendingOrders: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    buyer: { firstName: string; lastName: string };
  }>;
  chartData: Array<{ name: string; revenue: number; orders: number }>;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  deliveryAddress: string;
  note?: string;
  createdAt: string;
  buyer: { firstName: string; lastName: string };
  items: Array<{
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  quantity: number;
  unit: string;
  status: string;
  rating: number;
  reviewCount: number;
  category: { name: string };
  createdAt: string;
}

export interface EarningsHistory {
  totalEarnings: number;
  pendingPayout: number;
  withdrawn: number;
  thisMonth: number;
  chartData: Array<{ name: string; revenue: number; orders: number }>;
  transactions: Array<{
    id: string;
    reference: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export function useSellerDashboard() {
  return useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/seller/dashboard");
      return unwrap<SellerDashboardStats>(res);
    },
  });
}

export function useSellerSalesAnalytics(period?: "daily" | "weekly" | "monthly") {
  return useQuery({
    queryKey: ["seller-sales", period],
    queryFn: async () => {
      const params = period ? `?period=${period}` : "";
      const res = await apiClient.get(`/seller/dashboard/sales${params}`);
      return unwrap<{ chartData: Array<{ name: string; revenue: number; orders: number }> }>(res);
    },
  });
}

export function useSellerOrders(page: number = 1, status?: string) {
  return useQuery({
    queryKey: ["seller-orders", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "all") params.set("status", status);
      const res = await apiClient.get(`/orders/merchant-orders?${params}`);
      return unwrap<{ items: SellerOrder[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiClient.put(`/orders/${orderId}/status`, { status });
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] });
    },
  });
}

export function useSellerProducts(page: number = 1) {
  return useQuery({
    queryKey: ["seller-products", page],
    queryFn: async () => {
      const res = await apiClient.get(`/products?page=${page}&limit=20&merchant=me`);
      return unwrap<{ items: SellerProduct[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/products", data);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
}

export function useSellerEarnings(page: number = 1) {
  return useQuery({
    queryKey: ["seller-earnings", page],
    queryFn: async () => {
      const res = await apiClient.get(`/seller/dashboard/earnings?page=${page}&limit=20`);
      return unwrap<EarningsHistory>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await apiClient.get("/wallet");
      return unwrap<any>(res);
    },
  });
}

export function useWalletTransactions(page: number = 1) {
  return useQuery({
    queryKey: ["wallet-transactions", page],
    queryFn: async () => {
      const res = await apiClient.get(`/wallet/transactions?page=${page}&limit=20`);
      return unwrap<{ items: any[]; meta: { total: number; page: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; bankDetails: { bankName: string; accountNumber: string; accountName: string } }) => {
      const res = await apiClient.post("/wallet/withdraw", data);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}

export function useSellerProfile() {
  return useQuery({
    queryKey: ["seller-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/merchants/profile");
      return unwrap<any>(res);
    },
  });
}

export function useUpdateSellerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.put("/merchants/profile", data);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] });
    },
  });
}
