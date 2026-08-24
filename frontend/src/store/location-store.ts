import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocationMethod = "gps" | "manual" | null;

export interface LocationState {
  label: string;
  city?: string;
  state?: string;
  deliveryAddress?: string;
  lat?: number;
  lng?: number;
  radiusKm: number;
  method: LocationMethod;
  setLocation: (location: Partial<LocationState>) => void;
  clearLocation: () => void;
}

const defaults = {
  label: "Lagos, NG",
  city: undefined,
  state: undefined,
  deliveryAddress: undefined,
  lat: undefined,
  lng: undefined,
  radiusKm: 25,
  method: null as LocationMethod,
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      ...defaults,
      setLocation: (location) => set((state) => ({ ...state, ...location })),
      clearLocation: () => set({ ...defaults }),
    }),
    { name: "agrotech_location" }
  )
);

export function formatCoords(lat?: number, lng?: number): string {
  if (lat === undefined || lng === undefined) return "";
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
