"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useCart } from "@/hooks/use-cart";

function CartSyncer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useCartStore((s) => s.hydrate);
  const { data } = useCart(isAuthenticated);

  useEffect(() => {
    if (data) hydrate(data);
  }, [data, hydrate]);

  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartSyncer />
      {children}
    </>
  );
}
