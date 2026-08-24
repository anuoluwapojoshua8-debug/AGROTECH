"use client";

import { ProductCard } from "./product-card";
import { CardSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { PackageOpen } from "lucide-react";
import type { Product } from "@/hooks/use-products";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({ products, isLoading, emptyMessage }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <EmptyState
        icon={<PackageOpen className="h-16 w-16" />}
        title="No products found"
        description={emptyMessage || "Try adjusting your filters or search terms."}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
