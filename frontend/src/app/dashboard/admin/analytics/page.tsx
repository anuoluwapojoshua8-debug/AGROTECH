"use client";

import { useAdminStats } from "@/hooks/use-admin";
import { useAnalyticsOverview, useRevenueAnalytics, useTopProducts, useCategoryPerformance } from "@/hooks/use-analytics";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, ShoppingBag, Wallet, TrendingUp, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminStats();
  const { data: overview } = useAnalyticsOverview();
  const { data: revenue } = useRevenueAnalytics("monthly");
  const { data: topProducts } = useTopProducts(5);
  const { data: categories } = useCategoryPerformance();

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
    { title: "Total Users", value: overview?.users?.total ?? data?.totalUsers ?? 0, sub: `+${overview?.users?.new ?? 0} this month`, icon: <Users className="h-6 w-6" /> },
    { title: "Active Merchants", value: overview?.merchants?.total ?? data?.activeMerchants ?? 0, sub: `${overview?.merchants?.new ?? 0} new`, icon: <Store className="h-6 w-6" /> },
    { title: "Total Orders", value: overview?.orders?.total ?? data?.totalOrders ?? 0, sub: `${overview?.orders?.conversionRate ?? 0}% conv`, icon: <ShoppingBag className="h-6 w-6" /> },
    { title: "Revenue", value: formatPrice(overview?.revenue?.total ?? data?.totalRevenue ?? 0), sub: `Avg ${formatPrice(Number(overview?.revenue?.averageOrderValue ?? 0))}`, icon: <Wallet className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform performance overview — revenue, products, categories</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-1">
            <StatsCard title={stat.title} value={stat.value} icon={stat.icon} />
            <p className="text-xs text-muted-foreground px-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={data?.chartData ?? (revenue ?? []).map((r: any) => ({ name: r.date, revenue: r.amount, orders: 0 }))} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              Top Products (by revenue)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(topProducts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No delivered orders yet</p>
            ) : (
              <div className="space-y-3">
                {(topProducts ?? []).map((p: any) => (
                  <div key={p.productId} className="flex items-center justify-between rounded-xl border p-3">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.merchant} · {p.quantitySold} sold</p>
                    </div>
                    <p className="text-sm font-bold text-brand-600">{formatPrice(p.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-600" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {(categories ?? []).slice(0, 6).map((c: any) => (
              <div key={c.id} className="rounded-xl border p-3 flex justify-between">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.productCount} products · {c.totalSold} sold</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(c.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
