"use client";

import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliveryMapProps {
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  currentLat?: number | null;
  currentLng?: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  orderNumber?: string;
}

function buildOsmUrl(lat: number, lng: number, zoom = 15) {
  const delta = 0.02;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;
}

function buildDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function DeliveryMap({ deliveryLat, deliveryLng, currentLat, currentLng, pickupLat, pickupLng, orderNumber }: DeliveryMapProps) {
  const lat = currentLat ?? deliveryLat ?? pickupLat;
  const lng = currentLng ?? deliveryLng ?? pickupLng;

  if (lat == null || lng == null) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-muted/30 text-center p-4">
        <div>
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Map will appear once rider shares live location</p>
          <p className="text-xs text-muted-foreground mt-1">Order {orderNumber ? `#${orderNumber}` : ""} — live tracking via socket delivery:updateLocation</p>
        </div>
      </div>
    );
  }

  const isLive = currentLat != null && currentLng != null;
  const osmUrl = buildOsmUrl(lat, lng);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="relative h-56 w-full bg-muted">
        <iframe
          title={`Delivery map ${orderNumber ?? ""}`}
          src={osmUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {isLive && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-green-600 px-2.5 py-1 text-xs font-medium text-white shadow">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}
      </div>
      <div className="flex items-center justify-between p-3 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {isLive ? <Navigation className="h-3.5 w-3.5 text-green-600" /> : <MapPin className="h-3.5 w-3.5" />}
          {lat.toFixed(5)}, {lng.toFixed(5)} {isLive ? "· rider live" : "· delivery address"}
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
          <a href={buildDirectionsUrl(lat, lng)} target="_blank" rel="noopener noreferrer">
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}
