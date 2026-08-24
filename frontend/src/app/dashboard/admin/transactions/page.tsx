"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useAdminTransactions } from "@/hooks/use-admin";
import { useState } from "react";

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminTransactions(page);

  const transactions = (data?.items ?? []);

  const columns = [
    { key: "id", header: "Reference", cell: (t: any) => <span className="font-medium text-sm">{t.reference || t.id?.slice(0, 8)}</span> },
    { key: "type", header: "Type", cell: (t: any) => <Badge variant="outline" className="capitalize">{t.type?.toLowerCase()}</Badge> },
    {
      key: "amount",
      header: "Amount",
      cell: (t: any) => (
        <span className={`font-medium ${t.amount < 0 ? "text-destructive" : "text-brand-600"}`}>
          {formatPrice(Math.abs(t.amount))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t: any) => (
        <Badge variant={t.status === "completed" || t.status === "COMPLETED" || t.status === "cleared" ? "success" : "warning"}>
          {t.status?.toLowerCase()}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Date", cell: (t: any) => <span className="text-sm text-muted-foreground">{formatDateTime(t.createdAt)}</span> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">View all platform transactions</p>
      </div>
      <DataTable columns={columns} data={transactions} loading={isLoading} />
    </div>
  );
}
