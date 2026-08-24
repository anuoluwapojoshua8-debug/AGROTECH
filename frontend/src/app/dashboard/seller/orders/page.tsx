"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useSellerOrders, useUpdateOrderStatus } from "@/hooks/use-seller";
import { Check, X, Truck, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSellerOrders(page);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success(`Order updated to ${status}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const orders = (data?.items ?? []).map((o) => ({
    ...o,
    customer: `${o.buyer.firstName} ${o.buyer.lastName}`,
    items: o.items.map((i) => `${i.productName} x${i.quantity}`),
  }));

  const columns = [
    { key: "orderNumber", header: "Order", cell: (o: any) => <span className="font-medium">#{o.orderNumber}</span> },
    { key: "customer", header: "Customer" },
    { key: "items", header: "Items", cell: (o: any) => <span className="text-sm text-muted-foreground line-clamp-1">{o.items.join(", ")}</span> },
    { key: "total", header: "Total", cell: (o: any) => <span className="font-medium">{formatPrice(o.total)}</span> },
    {
      key: "status",
      header: "Status",
      cell: (o: any) => (
        <Badge variant={o.status === "DELIVERED" ? "success" : o.status === "SHIPPED" ? "info" : o.status === "PROCESSING" ? "warning" : "secondary"}>
          {o.status?.toLowerCase()}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Date", cell: (o: any) => <span className="text-sm text-muted-foreground">{formatDateTime(o.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      cell: (o: any) => (
        <div className="flex gap-1">
          {o.status === "PENDING" && (
            <>
              <Button variant="ghost" size="icon-sm" className="text-green-600" onClick={() => handleStatusUpdate(o.id, "CONFIRMED")}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-red-600" onClick={() => handleStatusUpdate(o.id, "CANCELLED")}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {o.status === "CONFIRMED" && (
            <Button variant="ghost" size="icon-sm" className="text-blue-600" onClick={() => handleStatusUpdate(o.id, "PROCESSING")}>
              <Truck className="h-4 w-4" />
            </Button>
          )}
          {o.status === "PROCESSING" && (
            <Button variant="ghost" size="icon-sm" className="text-blue-600" onClick={() => handleStatusUpdate(o.id, "SHIPPED")}>
              <Truck className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Incoming Orders</h1>
        <p className="text-sm text-muted-foreground">Manage and fulfill customer orders</p>
      </div>
      <DataTable columns={columns} data={orders} searchable searchKeys={["orderNumber", "customer"]} loading={isLoading} />
    </div>
  );
}
