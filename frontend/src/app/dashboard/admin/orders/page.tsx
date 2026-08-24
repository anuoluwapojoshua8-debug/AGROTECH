"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useAdminOrders } from "@/hooks/use-admin";
import { useState } from "react";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminOrders(page);

  const orders = (data?.items ?? []).map((o) => ({
    ...o,
    customer: o.buyer ? `${o.buyer.firstName} ${o.buyer.lastName}` : "Unknown",
  }));

  const columns = [
    { key: "orderNumber", header: "Order", cell: (o: any) => <span className="font-medium">#{o.orderNumber}</span> },
    { key: "customer", header: "Customer" },
    { key: "total", header: "Total", cell: (o: any) => <span className="font-medium">{formatPrice(o.total)}</span> },
    {
      key: "status",
      header: "Status",
      cell: (o: any) => (
        <Badge variant={o.status === "DELIVERED" ? "success" : o.status === "PROCESSING" || o.status === "CONFIRMED" ? "info" : "warning"}>
          {o.status?.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      cell: (o: any) => <Badge variant={o.paymentStatus === "PAID" || o.paymentStatus === "paid" ? "success" : "warning"}>{o.paymentStatus?.toLowerCase()}</Badge>,
    },
    { key: "createdAt", header: "Date", cell: (o: any) => <span className="text-sm text-muted-foreground">{formatDateTime(o.createdAt)}</span> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">View all marketplace orders</p>
      </div>
      <DataTable columns={columns} data={orders} searchable searchKeys={["orderNumber", "customer"]} loading={isLoading} />
    </div>
  );
}
