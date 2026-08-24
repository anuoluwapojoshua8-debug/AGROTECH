"use client";

import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuthStore } from "@/store/auth-store";

export default function WishlistPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: wishlistItems, isLoading } = useWishlist(isAuthenticated);
  const items = wishlistItems || [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold">My Wishlist</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>

        {isLoading ? (
          <PageLoading />
        ) : !isAuthenticated ? (
          <EmptyState
            icon={<Heart className="h-16 w-16" />}
            title="Sign in to see your wishlist"
            description="Your saved items are synced to your account."
            action={{ label: "Sign In", href: "/login" }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-16 w-16" />}
            title="Your wishlist is empty"
            description="Save items you love by tapping the heart icon."
            action={{ label: "Browse Products", href: "/" }}
          />
        ) : (
          <ProductGrid products={items} />
        )}
      </div>
    </div>
  );
}
