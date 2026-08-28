"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const res = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
      return unwrap<{ items: Notification[]; unreadCount: number; meta: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }>(res);
    },
    placeholderData: keepPreviousData,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications/unread-count");
      return unwrap<{ unreadCount: number }>(res);
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/notifications/${id}/read`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.put("/notifications/read-all");
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/notifications/${id}`);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}
