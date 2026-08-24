"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CartItem as CartItemType } from "@/store/cart-store";
import { useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/use-cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();

  return (
    <div className="flex gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${item.productId}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${item.productId}`}>
            <h3 className="text-sm font-semibold hover:text-brand-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">Per {item.unit}</p>
          <p className="mt-1 font-bold text-brand-600">{formatPrice(item.price)}</p>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-1 rounded-xl border">
            <button
              onClick={() => {
                if (item.quantity - 1 <= 0) {
                  removeItem.mutate(item.productId);
                } else {
                  updateQuantity.mutate({ productId: item.productId, quantity: item.quantity - 1 });
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-l-xl transition-colors hover:bg-muted"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-8 w-10 items-center justify-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
              disabled={item.quantity >= item.maxQuantity}
              className="flex h-8 w-8 items-center justify-center rounded-r-xl transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Subtotal + remove */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {formatPrice(item.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeItem.mutate(item.productId)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
