"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  user?: { id: string; firstName: string; lastName: string; email: string; avatar?: string; phone?: string };
  messages?: Array<{ id: string; message: string; senderId: string; isStaff: boolean; createdAt: string }>;
}

export function useAdminTickets(page: number = 1, status?: string) {
  return useQuery({
    queryKey: ["admin-tickets", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status && status !== "all") params.set("status", status);
      const res = await apiClient.get(`/support?${params}`);
      return unwrap<{ items: SupportTicket[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
  });
}

export function useAdminTicketStats() {
  return useQuery({
    queryKey: ["admin-ticket-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/support/stats");
      return unwrap<{ open: number; inProgress: number; resolved: number; closed: number; urgentHigh: number; total: number }>(res);
    },
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.put(`/support/${id}/status`, { status });
      return unwrap<any>(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin-ticket-stats"] });
    },
  });
}

export function useMyTickets(page: number = 1) {
  return useQuery({
    queryKey: ["my-tickets", page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      const res = await apiClient.get(`/support/my?${params}`);
      return unwrap<{ items: SupportTicket[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(res);
    },
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { subject: string; category: string; message: string; priority?: string }) => {
      const res = await apiClient.post("/support", dto);
      return unwrap<any>(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
    },
  });
}
