"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/components/shop/cart-item";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/store/cart-store";
import { useClearCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal } = useCartStore();
  const clearCart = useClearCart();
  const [promoCode, setPromoCode] = useState("");
  const deliveryFee = subtotal() >= 15000 ? 0 : 1500;
  const total = subtotal() + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<ShoppingBag className="h-16 w-16" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start shopping for fresh produce!"
          action={{ label: "Start Shopping", href: "/" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items in your cart
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => clearCart.mutate()} className="text-destructive">
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {/* Promo code */}
              <div className="mt-4 flex gap-2">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="h-9"
                />
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Tag className="h-3 w-3" />
                  Apply
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-brand-600">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {subtotal() < 15000 && (
                  <p className="text-xs text-muted-foreground">
                    Add {formatPrice(15000 - subtotal())} more for free delivery
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-brand-600">{formatPrice(total)}</span>
              </div>

              <Button asChild className="mt-6 w-full" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button variant="ghost" asChild className="mt-2 w-full gap-2">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
