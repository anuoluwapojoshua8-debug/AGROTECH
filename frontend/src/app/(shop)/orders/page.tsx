"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { useOrders, type Order } from "@/hooks/use-orders";
import { formatPrice, formatDateTime } from "@/lib/utils";

const fallbackOrders: any[] = [];

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  dispatched: "info",
  in_transit: "secondary",
  delivered: "success",
  cancelled: "destructive",
  returned: "secondary",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const { data: ordersData, isLoading } = useOrders();
  const orders: Order[] = ordersData?.items || [];

  if (isLoading) return <PageLoading />;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold">My Orders</h1>
        <p className="mb-8 text-sm text-muted-foreground">Track and manage your orders</p>

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-16 w-16" />}
            title="No orders yet"
            description="When you place an order, it will appear here."
            action={{ label: "Start Shopping", href: "/" }}
          />
        ) : (
          <>
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="pl-10"
              />
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    {/* Items preview */}
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-background">
                          <Image
                            src={item.productImage || "/placeholder.svg"}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold">#{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.items.map((i) => i.productName).join(", ")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className="font-bold text-brand-600">{formatPrice(order.total)}</p>
                      <Badge variant={statusStyles[order.status.toLowerCase()]} className="mt-1">
                        {order.status}
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
