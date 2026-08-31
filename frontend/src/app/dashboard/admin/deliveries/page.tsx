"use client";

import { useState } from "react";
import { Truck, MapPin, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import { usePendingDeliveries, useAssignRider } from "@/hooks/use-delivery";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export default function AdminDeliveriesPage() {
  const { data, isLoading } = usePendingDeliveries(1);
  const assign = useAssignRider();
  const [riderIds, setRiderIds] = useState<Record<string, string>>({});

  const deliveries = data?.items ?? [];

  const handleAssign = async (orderId: string) => {
    const riderId = riderIds[orderId]?.trim();
    if (!riderId) {
      toast.error("Enter rider user ID");
      return;
    }
    try {
      await assign.mutateAsync({ orderId, riderId });
      toast.success("Rider assigned");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to assign");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-brand-600" />
          Delivery Management
        </h1>
        <p className="text-sm text-muted-foreground">Assign riders and track pending deliveries</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : deliveries.length === 0 ? (
        <EmptyState icon={<Truck className="h-12 w-12" />} title="No pending deliveries" description="All orders are assigned." />
      ) : (
        <div className="grid gap-4">
          {deliveries.map((d) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">#{d.order?.orderNumber}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {d.order?.deliveryAddress}
                    </p>
                  </div>
                  <Badge variant="secondary">{d.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime((d as any).order?.createdAt || (d as any).createdAt || "")} · {(d as any).order?.total ? `₦${(d as any).order.total.toLocaleString()}` : ""}
                </p>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Rider user ID (role=RIDER)" value={riderIds[d.orderId] || ""} onChange={(e) => setRiderIds({ ...riderIds, [d.orderId]: e.target.value })} className="pl-10" />
                  </div>
                  <Button size="sm" onClick={() => handleAssign(d.orderId)} loading={assign.isPending}>
                    Assign
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Tip: Create a rider via register with role RIDER, then copy its user ID from /dashboard/admin/users.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
