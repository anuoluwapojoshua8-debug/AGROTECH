"use client";

import { useAdminStats } from "@/hooks/use-admin";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Users, Store, ShoppingBag, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminStats();

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

  const stats = [
    { title: "Total Users", value: data?.totalUsers ?? 0, icon: <Users className="h-6 w-6" /> },
    { title: "Active Merchants", value: data?.activeMerchants ?? 0, icon: <Store className="h-6 w-6" /> },
    { title: "Total Orders", value: data?.totalOrders ?? 0, icon: <ShoppingBag className="h-6 w-6" /> },
    { title: "Revenue", value: formatPrice(data?.totalRevenue ?? 0), icon: <Wallet className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform performance overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <SalesChart data={data?.chartData ?? []} />
    </div>
  );
}
