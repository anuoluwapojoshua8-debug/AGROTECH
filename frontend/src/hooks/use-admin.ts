"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface AdminStats {
  totalUsers: number;
  activeMerchants: number;
  totalOrders: number;
  totalRevenue: number;
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

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminMerchant {
  id: string;
  businessName: string;
  status: string;
  createdAt: string;
  businessAddress?: string;
  businessPhone?: string;
  description?: string;
  idDocument?: string | null;
  idDocumentType?: string | null;
  businessDocuments?: string[];
  bvn?: string | null;
  taxId?: string | null;
  produceTypes?: string[];
  user: { firstName: string; lastName: string; email: string; phone?: string };
  _count: { products: number };
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  quantity: number;
  status: string;
  createdAt: string;
  merchant: { businessName: string };
  category: { name: string };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  deliveryAddress: string;
  createdAt: string;
  buyer: { firstName: string; lastName: string; email: string };
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/analytics");
      return unwrap<AdminStats>(res);
    },
  });
}

export function useAdminUsers(page = 1, filters?: { role?: string; search?: string }) {
  return useQuery({
    queryKey: ["admin-users", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filters?.role) params.set("role", filters.role);
      if (filters?.search) params.set("search", filters.search);
      const res = await apiClient.get(`/admin/users?${params}`);
      return unwrap<{ items: AdminUser[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.post(`/admin/users/${userId}/suspend`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useAdminMerchants(page = 1, status?: string) {
  return useQuery({
    queryKey: ["admin-merchants", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "all") params.set("status", status);
      const res = await apiClient.get(`/admin/merchants?${params}`);
      return unwrap<{ items: AdminMerchant[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useApproveMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/admin/merchants/${id}/approve`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
    },
  });
}

export function useRejectMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await apiClient.put(`/admin/merchants/${id}/reject`, { reason });
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
    },
  });
}

export function useAdminProducts(page = 1, status?: string) {
  return useQuery({
    queryKey: ["admin-products", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "all") params.set("status", status);
      const res = await apiClient.get(`/admin/products?${params}`);
      return unwrap<{ items: AdminProduct[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useApproveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/admin/products/${id}/approve`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useRejectProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/admin/products/${id}/reject`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useAdminOrders(page = 1) {
  return useQuery({
    queryKey: ["admin-orders", page],
    queryFn: async () => {
      const res = await apiClient.get(`/orders?page=${page}&limit=20`);
      return unwrap<{ items: AdminOrder[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminTransactions(page = 1) {
  return useQuery({
    queryKey: ["admin-transactions", page],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/transactions?page=${page}&limit=20`);
      return unwrap<{ items: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/banners");
      return unwrap<any[]>(res);
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; subtitle?: string; imageUrl: string; link?: string; isActive?: boolean }) => {
      const res = await apiClient.post("/admin/banners", data);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/admin/banners/${id}`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });
}
