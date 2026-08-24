"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, Leaf, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { useAddToCart } from "@/hooks/use-cart";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import { useAuthStore } from "@/store/auth-store";
import type { Product } from "@/hooks/use-products";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const discount = calculateDiscount(product.price, product.comparePrice || 0);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: 1,
        item: {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          unit: product.unit,
          sellerId: product.merchant?.id || "",
          maxQuantity: product.quantity ?? 99,
        },
      });
      toast.success("Added to cart", {
        description: `${product.name} has been added to your cart.`,
      });
    } catch {
      toast.error("Could not add to cart", {
        description: "Please try again.",
      });
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await toggleWishlist.mutateAsync(product.id);
      setIsWishlisted(!isWishlisted);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {/* Image */}
      <Link href={`/products/${product.slug || product.id}`} className="relative block aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Tags */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              -{discount}%
            </Badge>
          )}
          {product.isOrganic && (
            <Badge variant="organic" className="text-[10px]">
              <Leaf className="mr-1 h-3 w-3" />
              Organic
            </Badge>
          )}
          {product.isFresh && <Badge variant="fresh" className="text-[10px]">Fresh</Badge>}
          {product.isFrozen && <Badge variant="frozen" className="text-[10px]">Frozen</Badge>}
        </div>
        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white dark:bg-dark-800/80"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"
            )}
          />
        </button>
        {/* Add to cart - visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
          <Button
            size="sm"
            className="w-full gap-2 shadow-lg"
            onClick={handleAddToCart}
            loading={addToCart.isPending}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
        {/* Out of stock overlay */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4">
        {/* Rating */}
        <div className="mb-1.5 flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{product.rating || 0}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
        </div>

        {/* Name */}
        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="text-sm font-semibold line-clamp-2 hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Unit */}
        <p className="mt-1 text-xs text-muted-foreground">Per {product.unit}</p>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-brand-600">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Delivery */}
        {product.deliveryTime && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Delivery in {product.deliveryTime}</span>
          </div>
        )}

        {/* Mobile add to cart */}
        <Button
          size="sm"
          className="mt-3 w-full gap-2 lg:hidden"
          onClick={handleAddToCart}
          loading={addToCart.isPending}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
