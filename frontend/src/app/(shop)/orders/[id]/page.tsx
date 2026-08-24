"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLoading } from "@/components/shared/loading";
import { useOrder } from "@/hooks/use-orders";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "IN_TRANSIT", "DELIVERED"];

const statusIcons: Record<string, any> = {
  PENDING: Package,
  CONFIRMED: CheckCircle,
  PROCESSING: Clock,
  DISPATCHED: Truck,
  IN_TRANSIT: Truck,
  DELIVERED: CheckCircle,
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) return <PageLoading />;

  const currentIdx = statusOrder.indexOf(order.status);
  const timeline = statusOrder.map((s, i) => ({
    status: s,
    label: s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " "),
    date: i <= currentIdx ? (i === currentIdx ? (order.updatedAt || order.createdAt) : order.createdAt) : "",
    completed: i <= currentIdx,
  }));

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back */}
        <Button variant="ghost" asChild className="mb-4 gap-2">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge variant={order.status.toLowerCase() === "delivered" ? "success" : "info"} className="w-fit text-sm px-3 py-1">
            {order.status}
          </Badge>
        </div>

        {/* Status Timeline */}
        <div className="mb-8 rounded-2xl border bg-card p-6">
          <h2 className="mb-6 text-lg font-semibold">Order Status</h2>
          <div className="relative">
            {timeline.map((step, i) => {
              const Icon = statusIcons[step.status] || Package;
              return (
                <div key={step.status} className="flex items-start gap-4 pb-8 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2",
                        step.completed
                          ? "border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-950"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {i < timeline.length - 1 && (
                      <div
                        className={cn(
                          "absolute top-10 h-full w-0.5",
                          step.completed ? "bg-brand-600" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={cn("font-medium", !step.completed && "text-muted-foreground")}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-muted-foreground">{formatDateTime(step.date)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Items */}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Items</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={item.productImage || "/placeholder.svg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.productId}`} className="font-medium hover:text-brand-600">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Delivery Info */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{order.deliveryAddress}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Payment</h2>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{(order.paymentMethod || "N/A").toString().replace(/_/g, " ")}</span>
                <Badge variant={order.paymentStatus?.toLowerCase() === "paid" ? "success" : "warning"} className="ml-auto">
                  {order.paymentStatus || "PENDING"}
                </Badge>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{order.deliveryFee === 0 ? <span className="text-brand-600">Free</span> : formatPrice(order.deliveryFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-destructive">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-brand-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
