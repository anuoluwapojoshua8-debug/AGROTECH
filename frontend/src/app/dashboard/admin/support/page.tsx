"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { formatDateTime } from "@/lib/utils";
import { MessageSquare, Clock, CheckCircle, AlertCircle, User } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  lastReply: string;
  messages: number;
}

const mockTickets: SupportTicket[] = [
  {
    id: "TKT-001",
    subject: "Order not delivered on time",
    customer: "Adaeze Okonkwo",
    category: "Delivery",
    status: "open",
    priority: "high",
    createdAt: "2025-01-15T10:30:00Z",
    lastReply: "2025-01-15T11:45:00Z",
    messages: 3,
  },
  {
    id: "TKT-002",
    subject: "Wrong item received",
    customer: "Emeka Nwankwo",
    category: "Order Issue",
    status: "in_progress",
    priority: "medium",
    createdAt: "2025-01-14T14:20:00Z",
    lastReply: "2025-01-15T09:10:00Z",
    messages: 5,
  },
  {
    id: "TKT-003",
    subject: "Refund request for cancelled order",
    customer: "Fatima Abubakar",
    category: "Refund",
    status: "resolved",
    priority: "medium",
    createdAt: "2025-01-13T08:00:00Z",
    lastReply: "2025-01-14T16:30:00Z",
    messages: 4,
  },
  {
    id: "TKT-004",
    subject: "Cannot login to account",
    customer: "Tunde Bakare",
    category: "Account",
    status: "open",
    priority: "urgent",
    createdAt: "2025-01-15T12:00:00Z",
    lastReply: "2025-01-15T12:05:00Z",
    messages: 1,
  },
  {
    id: "TKT-005",
    subject: "Product quality complaint",
    customer: "Ngozi Eze",
    category: "Quality",
    status: "closed",
    priority: "low",
    createdAt: "2025-01-10T09:15:00Z",
    lastReply: "2025-01-12T14:20:00Z",
    messages: 6,
  },
  {
    id: "TKT-006",
    subject: "Payment failed but money deducted",
    customer: "Oluwaseun Adeyemi",
    category: "Payment",
    status: "open",
    priority: "urgent",
    createdAt: "2025-01-15T13:45:00Z",
    lastReply: "2025-01-15T13:50:00Z",
    messages: 2,
  },
  {
    id: "TKT-007",
    subject: "How to become a seller",
    customer: "Blessing Okoro",
    category: "General",
    status: "resolved",
    priority: "low",
    createdAt: "2025-01-11T11:00:00Z",
    lastReply: "2025-01-11T14:00:00Z",
    messages: 3,
  },
];

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  open: "warning",
  in_progress: "info",
  resolved: "success",
  closed: "secondary",
};

const priorityStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  urgent: "destructive",
};

export default function AdminSupportPage() {
  const [tickets] = useState<SupportTicket[]>(mockTickets);

  const columns = [
    {
      key: "id",
      header: "Ticket",
      cell: (t: SupportTicket) => <span className="font-medium font-mono text-sm">{t.id}</span>,
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
      key: "customer",
      header: "Customer",
      cell: (t: SupportTicket) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {t.customer.split(" ").map(n => n[0]).join("")}
          </div>
          <span className="text-sm">{t.customer}</span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      cell: (t: SupportTicket) => (
        <Badge variant={priorityStyles[t.priority]} className="capitalize">
          {t.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t: SupportTicket) => (
        <Badge variant={statusStyles[t.status]} className="capitalize">
          {t.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "messages",
      header: "Messages",
      cell: (t: SupportTicket) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          {t.messages}
        </div>
      ),
    },
    {
      key: "lastReply",
      header: "Last Reply",
      cell: (t: SupportTicket) => <span className="text-sm text-muted-foreground">{formatDateTime(t.lastReply)}</span>,
    },
  ];

  const openCount = tickets.filter((t) => t.status === "open").length;
  const urgentCount = tickets.filter((t) => t.priority === "urgent" && t.status !== "closed" && t.status !== "resolved").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">Manage customer support requests</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-xs text-muted-foreground">Open Tickets</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{urgentCount}</p>
              <p className="text-xs text-muted-foreground">Urgent</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "resolved" || t.status === "closed").length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        searchable
        searchKeys={["subject", "customer", "id", "category"]}
      />
    </div>
  );
}
