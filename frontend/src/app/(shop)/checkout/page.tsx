"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, Banknote, Wallet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/store/cart-store";
import { useLocationStore } from "@/store/location-store";
import { useCreateOrder } from "@/hooks/use-orders";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

const paymentMethods = [
  { value: "PAYSTACK", label: "Paystack", icon: Wallet, desc: "Pay with card, bank transfer or USSD" },
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive your order" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "Transfer to our bank account" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const location = useLocationStore();
  const [paymentMethod, setPaymentMethod] = useState("PAYSTACK");
  const [notes, setNotes] = useState("");
  const createOrder = useCreateOrder();

  const deliveryFee = subtotal() >= 15000 ? 0 : 1500;
  const total = subtotal() + deliveryFee;

  const deliveryAddress = location.label
    ? `${location.label}${location.deliveryAddress ? ", " + location.deliveryAddress : ""}${location.city ? ", " + location.city : ""}${location.state ? ", " + location.state : ""}`
    : "Delivery location not set";

  const handlePlaceOrder = async () => {
    try {
      await createOrder.mutateAsync({
        deliveryAddress,
        note: notes || undefined,
        paymentMethod,
        deliveryLat: location.lat,
        deliveryLng: location.lng,
      });
      clearCart();
      toast.success("Order placed successfully!", {
        description: "You'll receive a confirmation shortly.",
      });
      router.push("/orders");
    } catch {
      toast.error("Failed to place order", {
        description: "Please try again or contact support.",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<Wallet className="h-16 w-16" />}
          title="Your cart is empty"
          description="Add items to your cart before checking out."
          action={{ label: "Start Shopping", href: "/" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Delivery Location */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Delivery Location</h2>
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <MapPin className="h-5 w-5 text-brand-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{deliveryAddress}</p>
                  {location.lat !== undefined && location.lng !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              {(!location.lat || !location.lng) && (
                <p className="mt-2 text-xs text-amber-600">
                  Please set your delivery location from the map before placing your order.
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all",
                      paymentMethod === method.value
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <RadioGroupItem value={method.value} />
                    <method.icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Order Notes */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for the seller or delivery..."
                className="min-h-[100px] w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-brand-600" : ""}>
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-brand-600">{formatPrice(total)}</span>
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={handlePlaceOrder}
                loading={createOrder.isPending}
              >
                Place Order — {formatPrice(total)}
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                By placing this order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
