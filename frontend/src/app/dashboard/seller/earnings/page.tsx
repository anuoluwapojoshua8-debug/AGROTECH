"use client";

import { Wallet, Banknote, TrendingUp, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { DataTable } from "@/components/dashboard/data-table";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSellerEarnings } from "@/hooks/use-seller";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerEarningsPage() {
  const { data, isLoading } = useSellerEarnings();

  const stats = [
    { title: "Total Earnings", value: formatPrice(data?.totalEarnings ?? 0), icon: <Wallet className="h-6 w-6" /> },
    { title: "Pending Payout", value: formatPrice(data?.pendingPayout ?? 0), icon: <Clock className="h-6 w-6" /> },
    { title: "Withdrawn", value: formatPrice(data?.withdrawn ?? 0), icon: <Banknote className="h-6 w-6" /> },
    { title: "This Month", value: formatPrice(data?.thisMonth ?? 0), icon: <TrendingUp className="h-6 w-6" /> },
  ];

  const transactions = (data?.transactions ?? []).map((t) => ({
    ...t,
    order: t.reference,
  }));

  const columns = [
    { key: "order", header: "Reference", cell: (t: any) => <span className="font-medium">{t.order}</span> },
    {
      key: "amount",
      header: "Amount",
      cell: (t: any) => (
        <span className={`font-medium ${t.amount < 0 ? "text-destructive" : "text-brand-600"}`}>
          {t.amount < 0 ? "-" : "+"}{formatPrice(Math.abs(t.amount))}
        </span>
      ),
    },
    { key: "type", header: "Type", cell: (t: any) => <Badge variant="outline" className="capitalize">{t.type}</Badge> },
    {
      key: "status",
      header: "Status",
      cell: (t: any) => (
        <Badge variant={t.status === "completed" || t.status === "cleared" ? "success" : "warning"}>{t.status}</Badge>
      ),
    },
    { key: "createdAt", header: "Date", cell: (t: any) => <span className="text-sm text-muted-foreground">{formatDateTime(t.createdAt)}</span> },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[350px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-sm text-muted-foreground">Track your sales and payouts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <SalesChart data={data?.chartData ?? []} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
        <DataTable columns={columns} data={transactions} />
      </div>
    </div>
  );
}
