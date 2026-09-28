"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, Banknote, Wallet, MapPin, Tag, Loader2, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/store/cart-store";
import { useLocationStore } from "@/store/location-store";
import { useCreateOrder } from "@/hooks/use-orders";
import { useValidateCoupon } from "@/hooks/use-coupons";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import Link from "next/link";

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
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; discountType: string; discountValue: number } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();

  const { data: addresses } = useQuery({
    queryKey: ["addresses-checkout"],
    queryFn: async () => {
      const res = await apiClient.get("/users/addresses");
      return (res.data as any)?.data as any[] || res.data;
    },
  });

  const selectedAddr = (addresses || []).find((a: any) => a.id === selectedAddressId);

  const deliveryFee = subtotal() >= 15000 ? 0 : 1500;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal() + deliveryFee - discount;

  const deliveryAddress = selectedAddr
    ? `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} (${selectedAddr.label}) - ${selectedAddr.phone}`
    : location.label
    ? `${location.label}${location.deliveryAddress ? ", " + location.deliveryAddress : ""}${location.city ? ", " + location.city : ""}${location.state ? ", " + location.state : ""}`
    : "Delivery location not set";

  const deliveryLat = selectedAddr?.lat ?? location.lat;
  const deliveryLng = selectedAddr?.lng ?? location.lng;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({ code: promoCode.trim(), orderAmount: subtotal() });
      if (result.valid) {
        setAppliedCoupon({ code: result.code, discountAmount: result.discountAmount, discountType: result.discountType, discountValue: result.discountValue });
        toast.success(`Promo applied! You save ${formatPrice(result.discountAmount)}`);
      } else {
        toast.error("Invalid promo code");
      }
    } catch {
      toast.error("Invalid or expired promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setPromoCode("");
  };

  const handlePlaceOrder = async () => {
    if (deliveryAddress === "Delivery location not set") {
      toast.error("Please select an address or set delivery location");
      return;
    }
    try {
      await createOrder.mutateAsync({
        deliveryAddress,
        note: notes || undefined,
        paymentMethod,
        deliveryLat,
        deliveryLng,
        couponCode: appliedCoupon?.code,
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
            {/* Delivery Location — Saved Addresses */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>
              {(addresses || []).length > 0 ? (
                <div className="space-y-2 mb-4">
                  {(addresses || []).map((addr: any) => (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all ${selectedAddressId === addr.id ? "border-brand-600 bg-brand-50 dark:bg-brand-950" : "border-border"}`}
                    >
                      <input
                        type="radio"
                        name="checkout-address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-600" />
                          {addr.label} {addr.isDefault && <span className="text-xs bg-brand-600 text-white px-1.5 py-0.5 rounded">Default</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}, {addr.state}</p>
                        <p className="text-xs text-muted-foreground">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${!selectedAddressId ? "border-brand-600 bg-brand-50 dark:bg-brand-950" : "border-border"}`}>
                    <input type="radio" name="checkout-address" checked={!selectedAddressId} onChange={() => setSelectedAddressId(null)} />
                    <span className="text-sm font-medium">Use map location</span>
                  </label>
                </div>
              ) : (
                <p className="mb-4 text-sm text-muted-foreground">
                  No saved addresses. <Link href="/dashboard/buyer/addresses" className="text-brand-600 underline">Add one</Link> or use map below.
                </p>
              )}
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <MapPin className="h-5 w-5 text-brand-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{deliveryAddress}</p>
                  {deliveryLat !== undefined && deliveryLng !== undefined && (
                    <p className="text-xs text-muted-foreground">Coordinates: {Number(deliveryLat).toFixed(4)}, {Number(deliveryLng).toFixed(4)}</p>
                  )}
                </div>
              </div>
              {(!deliveryLat || !deliveryLng) && !selectedAddressId && (
                <p className="mt-2 text-xs text-amber-600">Please select an address or set delivery location from map.</p>
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

            {/* Promo Code */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Promo Code</h2>
              {appliedCoupon ? (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {appliedCoupon.code.toUpperCase()} — {appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}% off` : `${formatPrice(appliedCoupon.discountValue)} off`}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">You save {formatPrice(appliedCoupon.discountAmount)}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={handleRemovePromo}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="pl-10"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyPromo} disabled={validateCoupon.isPending || !promoCode.trim()}>
                    {validateCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
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
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
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
