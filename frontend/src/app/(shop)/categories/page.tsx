"use client";

import { CategoryCard } from "@/components/shop/category-card";
import { PageLoading } from "@/components/shared/loading";
import { useCategories } from "@/hooks/use-categories";
import { EmptyState } from "@/components/shared/empty-state";
import { Grid3X3 } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <PageLoading />;

  return (
    <div className="min-h-screen">
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold">All Categories</h1>
          <p className="mt-2 text-muted-foreground">Browse our wide selection of farm-fresh produce</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {!categories?.length ? (
          <EmptyState
            icon={<Grid3X3 className="h-16 w-16" />}
            title="No categories yet"
            description="Categories will appear once they are added by the admin."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={{
                  id: category.id,
                  name: category.name,
                  slug: category.slug,
                  image: category.image || "",
                  productCount: category._count?.products || 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
