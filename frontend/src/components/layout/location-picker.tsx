"use client";

import { useState } from "react";
import { LocateFixed, MapPin, Navigation, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocationStore, formatCoords } from "@/store/location-store";
import { toast } from "sonner";

export function LocationPicker({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { label, city, state, deliveryAddress, lat, lng, radiusKm, setLocation } =
    useLocationStore();

  const [locating, setLocating] = useState(false);
  const [formLabel, setFormLabel] = useState(label);
  const [formCity, setFormCity] = useState(city || "");
  const [formState, setFormState] = useState(state || "");
  const [formAddress, setFormAddress] = useState(deliveryAddress || "");
  const [formRadius, setFormRadius] = useState(radiusKm);

  const useGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Please enter your location manually.",
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        setLocation({
          label: "Current location",
          lat: latitude,
          lng: longitude,
          method: "gps",
          deliveryAddress: formatCoords(latitude, longitude),
        });
        toast.success("Location detected", {
          description: formatCoords(latitude, longitude),
        });
        onClose();
      },
      (error) => {
        setLocating(false);
        toast.error("Could not detect location", {
          description: error.message || "Please enter your location manually.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = () => {
    if (!formAddress.trim() && (lat === undefined || lng === undefined)) {
      toast.error("Enter a delivery address or use GPS");
      return;
    }
    setLocation({
      label: formLabel.trim() || formCity.trim() || "My location",
      city: formCity.trim() || undefined,
      state: formState.trim() || undefined,
      deliveryAddress: formAddress.trim() || deliveryAddress,
      radiusKm: formRadius,
      method: formAddress.trim() ? "manual" : "gps",
    });
    toast.success("Delivery location updated");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set delivery location</DialogTitle>
          <DialogDescription>
            We use this to show local sellers and estimate delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Button variant="outline" className="w-full gap-2" onClick={useGps} loading={locating}>
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            Use my current location (GPS)
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide text-muted-foreground">
              <span className="bg-background px-2">or enter manually</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="loc-label">Label</Label>
                <Input id="loc-label" placeholder="Home, Farm, Office..." value={formLabel} onChange={(e) => setFormLabel(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loc-city">City</Label>
                <Input id="loc-city" placeholder="Lagos" value={formCity} onChange={(e) => setFormCity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-state">State</Label>
              <Input id="loc-state" placeholder="Lagos" value={formState} onChange={(e) => setFormState(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-address">Delivery address</Label>
              <Input id="loc-address" placeholder="42 Adeola Odeku Street, Victoria Island" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Delivery radius</Label>
                <span className="text-sm font-medium text-brand-600">{formRadius} km</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={formRadius}
                onChange={(e) => setFormRadius(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            {(lat !== undefined || lng !== undefined) && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Navigation className="h-3.5 w-3.5" />
                Last GPS: {formatCoords(lat, lng)}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <MapPin className="h-4 w-4" />
            Save location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
