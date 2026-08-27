"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/dashboard/data-table";
import { formatDateTime } from "@/lib/utils";
import { Plus, MessagesSquare } from "lucide-react";
import { useMyTickets, useCreateSupportTicket, type SupportTicket } from "@/hooks/use-support";
import { toast } from "sonner";

const statusStyles: Record<string, "default" | "secondary" | "warning" | "success" | "info"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const categories = [
  "Order Issue",
  "Payment Problem",
  "Product Quality",
  "Delivery / Shipping",
  "Refund",
  "Account",
  "Other",
];

export default function BuyerSupportPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "Order Issue", message: "", priority: "MEDIUM" });
  const { data, isLoading } = useMyTickets();
  const createTicket = useCreateSupportTicket();

  const tickets = data?.items ?? [];

  const handleCreate = async () => {
    if (!form.subject || !form.message) {
      toast.error("Please fill in subject and message");
      return;
    }
    try {
      await createTicket.mutateAsync(form);
      toast.success("Support ticket created!");
      setForm({ subject: "", category: "Order Issue", message: "", priority: "MEDIUM" });
      setShowForm(false);
    } catch {
      toast.error("Failed to create ticket");
    }
  };

  const columns = [
    {
      key: "ticketNumber",
      header: "Ticket",
      cell: (t: SupportTicket) => <span className="font-mono text-sm font-medium">{t.ticketNumber}</span>,
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
      key: "priority",
      header: "Priority",
      cell: (t: SupportTicket) => (
        <Badge variant={t.priority === "URGENT" ? "destructive" : t.priority === "HIGH" ? "warning" : "secondary"} className="capitalize">
          {t.priority.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t: SupportTicket) => (
        <Badge variant={statusStyles[t.status]} className="capitalize">
          {t.status.toLowerCase().replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "messages",
      header: "Conversation",
      cell: (t: SupportTicket) => (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessagesSquare className="h-3.5 w-3.5" />
          {t._count?.messages ?? 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (t: SupportTicket) => <span className="text-sm text-muted-foreground">{formatDateTime(t.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Get help with your orders, payments, and account</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Create a New Ticket</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Subject</Label>
              <Input placeholder="Briefly describe your issue" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Message</Label>
              <Textarea rows={4} placeholder="Provide details about your issue" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCreate} loading={createTicket.isPending}>Submit Ticket</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

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
