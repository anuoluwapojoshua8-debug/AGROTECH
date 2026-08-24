"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGrid } from "@/components/shop/product-grid";
import { PageLoading } from "@/components/shared/loading";
import { useProducts } from "@/hooks/use-products";
import { useCategory } from "@/hooks/use-categories";
import { EmptyState } from "@/components/shared/empty-state";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("popular");

  const { data: category, isLoading: categoryLoading, isError } = useCategory(slug);
  const { data: productsData, isLoading } = useProducts({ categoryId: category?.id, sort, limit: 50 });
  const categoryProducts = productsData?.items || [];

  if (!slug || categoryLoading) return <PageLoading />;

  if (isError || !category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Category not found"
          description="The category you are looking for does not exist."
          action={{ label: "Browse all products", href: "/search" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {category.description || `Fresh ${category.name.toLowerCase()} sourced directly from local farms`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters sidebar */}
          <aside className="hidden space-y-6 lg:block">
            <div>
              <h3 className="mb-3 font-semibold">Price Range</h3>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" className="h-9" />
                <span className="text-muted-foreground">—</span>
                <Input type="number" placeholder="Max" className="h-9" />
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="mb-3 font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["Fresh", "Organic", "Frozen", "Premium", "Local"].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="mb-3 font-semibold">Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((star) => (
                  <label key={star} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-brand-600" />
                    <span>{star}+ stars</span>
                  </label>
                ))}
              </div>
            </div>
            <Button variant="outline" className="w-full">Apply Filters</Button>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <strong>{Array.isArray(categoryProducts) ? categoryProducts.length : 0}</strong> products
              </p>
              <div className="flex items-center gap-3">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex rounded-lg border">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ProductGrid products={Array.isArray(categoryProducts) ? categoryProducts : []} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
