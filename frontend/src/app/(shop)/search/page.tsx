"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGrid } from "@/components/shop/product-grid";
import { useSearchProducts, useProducts } from "@/hooks/use-products";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const { data: searchResults, isLoading } = query
    ? useSearchProducts(query)
    : useProducts({ sort, limit: 50 });

  const results = query ? searchResults : (searchResults as any)?.items || [];

  const resultCount = Array.isArray(results) ? results.length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <form onSubmit={handleSubmit} className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="h-12 rounded-2xl pl-12 pr-20 text-base"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {query ? (
              <>Results for "<strong className="text-foreground">{query}</strong>"</>
            ) : (
              "Browse all products"
            )}
            <span className="ml-1">({resultCount})</span>
          </p>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ProductGrid products={Array.isArray(results) ? results : []} isLoading={isLoading} />
      </div>
    </div>
  );
}
