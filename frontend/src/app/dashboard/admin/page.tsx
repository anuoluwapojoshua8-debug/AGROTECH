"use client";

import { Users, Store, ShoppingBag, Wallet } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { useAdminStats } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px] rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminStats();

  if (isLoading) return <AdminSkeleton />;

  const stats = [
    { title: "Total Users", value: data?.totalUsers ?? 0, icon: <Users className="h-6 w-6" /> },
    { title: "Active Merchants", value: data?.activeMerchants ?? 0, icon: <Store className="h-6 w-6" /> },
    { title: "Total Orders", value: data?.totalOrders ?? 0, icon: <ShoppingBag className="h-6 w-6" /> },
    { title: "Revenue", value: formatPrice(data?.totalRevenue ?? 0), icon: <Wallet className="h-6 w-6" /> },
  ];

  const recentOrders = (data?.recentOrders ?? []).map((o) => ({
    _id: o.id,
    orderNumber: o.orderNumber,
    customer: o.buyer,
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your marketplace</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={data?.chartData ?? []} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
