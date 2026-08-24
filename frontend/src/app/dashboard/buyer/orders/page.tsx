"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useOrders, type Order } from "@/hooks/use-orders";
import { useState } from "react";

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default function BuyerOrdersPage() {
  const [page] = useState(1);
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useOrders(page);

  const orders = (data?.items ?? []).filter((o) => {
    if (tab === "all") return true;
    if (tab === "processing") return ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status);
    if (tab === "delivered") return o.status === "DELIVERED";
    if (tab === "cancelled") return o.status === "CANCELLED";
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-muted-foreground">Track and manage your orders</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="processing">Active</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<Package className="h-12 w-12" />}
              title={tab === "all" ? "No orders yet" : `No ${tab} orders`}
              description={tab === "all" ? "Start shopping to see your orders here." : undefined}
              action={tab === "all" ? { label: "Browse Products", href: "/" } : undefined}
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-background">
                          <Image src={item.productImage || "/placeholder.svg"} alt={item.productName} fill className="object-cover" sizes="56px" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.items.length} items · {formatDateTime(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-brand-600">{formatPrice(order.total)}</p>
                      <Badge variant={statusStyles[order.status] || "default"} className="text-[10px]">{order.status?.toLowerCase()}</Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
