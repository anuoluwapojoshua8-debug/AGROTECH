"use client";

import Link from "next/link";
import { ShoppingBag, Heart, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useOrders } from "@/hooks/use-orders";
import { useUnreadCount } from "@/hooks/use-chat";
import { useCurrentUser } from "@/hooks/use-auth";

export default function BuyerDashboardPage() {
  const user = useCurrentUser();
  const { data: ordersData } = useOrders(1, 5);
  const { data: unread } = useUnreadCount();

  const recentOrders = ordersData?.items ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{user.user?.firstName ? `, ${user.user.firstName}` : ""}! Here&apos;s your overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ordersData?.meta?.total ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unread?.unreadCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/dashboard/buyer/orders">View All <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No orders yet</p>
          ) : (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} items · {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                  <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "info"} className="text-[10px]">
                    {order.status?.toLowerCase()}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
