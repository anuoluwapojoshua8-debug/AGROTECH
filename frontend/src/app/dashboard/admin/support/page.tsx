"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { formatDateTime } from "@/lib/utils";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useAdminTickets, useAdminTicketStats, useUpdateTicketStatus, type SupportTicket } from "@/hooks/use-support";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const priorityStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
};

export default function AdminSupportPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading } = useAdminTickets(page, statusFilter);
  const { data: stats } = useAdminTicketStats();
  const updateStatus = useUpdateTicketStatus();

  const tickets = data?.items ?? [];

  const handleStatusChange = async (ticket: SupportTicket, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status });
      toast.success(`Ticket ${ticket.ticketNumber} marked ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update ticket status");
    }
  };

  const columns = [
    {
      key: "ticketNumber",
      header: "Ticket",
      cell: (t: SupportTicket) => <span className="font-medium font-mono text-sm">{t.ticketNumber}</span>,
    },
    {
      key: "subject",
      header: "Subject",
      cell: (t: SupportTicket) => (
        <div>
          <p className="font-medium">{t.subject}</p>
          <p className="text-xs text-muted-foreground">{t.category}</p>
        </div>
      ),
    },
    {
      key: "user",
      header: "Customer",
      cell: (t: SupportTicket) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {t.user ? `${t.user.firstName[0]}${t.user.lastName[0]}` : "?"}
          </div>
          <div>
            <span className="text-sm">{t.user ? `${t.user.firstName} ${t.user.lastName}` : "Unknown"}</span>
            {t.user?.email && <p className="text-xs text-muted-foreground">{t.user.email}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      cell: (t: SupportTicket) => (
        <Badge variant={priorityStyles[t.priority]} className="capitalize">
          {t.priority.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t: SupportTicket) => (
        <Select value={t.status} onValueChange={(v) => handleStatusChange(t, v)} disabled={updateStatus.isPending}>
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "messages",
      header: "Messages",
      cell: (t: SupportTicket) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          {t._count?.messages ?? 0}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (t: SupportTicket) => <span className="text-sm text-muted-foreground">{formatDateTime(t.createdAt)}</span>,
    },
  ];

  const statCards = [
    { label: "Open", value: stats?.open ?? 0, icon: AlertCircle, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
    { label: "In Progress", value: stats?.inProgress ?? 0, icon: Clock, color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
    { label: "Resolved", value: stats?.resolved ?? 0, icon: CheckCircle, color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
    { label: "Urgent/High", value: stats?.urgentHigh ?? 0, icon: AlertCircle, color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">Manage customer support requests</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        searchable
        searchKeys={["subject", "ticketNumber", "category"]}
        loading={isLoading}
      />
    </div>
  );
}
