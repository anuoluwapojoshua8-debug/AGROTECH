"use client";

import { useState } from "react";
import { Truck, MapPin, CheckCircle, Navigation, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { useRiderDeliveries, useStartDelivery, useMarkDelivered, useUpdateDeliveryLocation } from "@/hooks/use-delivery";
import { DeliveryMap } from "@/components/delivery/delivery-map";
import { toast } from "sonner";
import Link from "next/link";

export default function RiderDashboardPage() {
  const [status, setStatus] = useState("all");
  const { data, isLoading } = useRiderDeliveries(1, status);
  const start = useStartDelivery();
  const deliver = useMarkDelivered();
  const updateLoc = useUpdateDeliveryLocation();
  const [sharing, setSharing] = useState<string | null>(null);

  const deliveries = data?.items ?? [];

  const handleStart = async (orderId: string) => {
    try {
      await start.mutateAsync(orderId);
      toast.success("Delivery started");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to start");
    }
  };
  const handleDeliver = async (orderId: string) => {
    try {
      await deliver.mutateAsync({ orderId });
      toast.success("Marked as delivered");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };
  const handleShareLocation = async (orderId: string) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setSharing(orderId);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateLoc.mutateAsync({ orderId, lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success(`Live location shared: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } catch (e: any) {
          toast.error(e?.response?.data?.message || "Failed to share location");
        } finally {
          setSharing(null);
        }
      },
      () => {
        toast.error("Failed to get location — allow GPS");
        setSharing(null);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-brand-600" />
          Rider Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Manage your assigned deliveries</p>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : deliveries.length === 0 ? (
        <EmptyState icon={<Package className="h-12 w-12" />} title="No deliveries" description="Assigned deliveries will appear here." />
      ) : (
        <div className="grid gap-4">
          {deliveries.map((d) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">#{d.order?.orderNumber}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {d.order?.deliveryAddress}
                    </p>
                  </div>
                  <Badge variant={d.status === "delivered" ? "success" : d.status === "in_transit" ? "info" : "secondary"}>{d.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(d.startedAt || d.completedAt || "")}
                  {d.currentLat && d.currentLng && (
                    <span className="ml-2 flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-brand-600" />
                      {d.currentLat.toFixed(4)}, {d.currentLng.toFixed(4)}
                    </span>
                  )}
                </div>
                <DeliveryMap currentLat={d.currentLat} currentLng={d.currentLng} deliveryLat={d.dropoffLat} deliveryLng={d.dropoffLng} orderNumber={d.order?.orderNumber} />
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${d.orderId}`}>View Order</Link>
                  </Button>
                  {d.status === "assigned" && (
                    <Button size="sm" onClick={() => handleStart(d.orderId)} loading={start.isPending}>
                      Start Delivery
                    </Button>
                  )}
                  {d.status === "in_transit" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleShareLocation(d.orderId)} disabled={sharing === d.orderId || updateLoc.isPending} className="gap-1">
                        <Navigation className="h-4 w-4" />
                        {sharing === d.orderId ? "Sharing..." : "Share live location"}
                      </Button>
                      <Button size="sm" onClick={() => handleDeliver(d.orderId)} loading={deliver.isPending} className="gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Mark Delivered
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
