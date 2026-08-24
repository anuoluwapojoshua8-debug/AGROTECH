"use client";

import { formatPrice, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import Link from "next/link";

interface RecentOrdersProps {
  orders: Array<{
    _id: string;
    orderNumber: string;
    customer?: { firstName: string; lastName: string };
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between p-4 pb-0">
        <h3 className="font-semibold">Recent Orders</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin/orders">View All</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No orders yet
              </TableCell>
            </TableRow>
          ) : (
            orders?.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                <TableCell>
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusStyles[order.status] || "default"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={order.paymentStatus === "paid" ? "success" : "warning"}
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(order.total)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/dashboard/admin/orders/${order._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
