"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductGrid } from "@/components/shop/product-grid";
import { PageLoading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { getInitials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

interface MerchantPublicProfile {
  id: string;
  businessName: string;
  businessAddress: string;
  description?: string;
  businessLogo?: string;
  rating?: number;
  totalProducts?: number;
  joinedAt?: string;
}

interface MerchantProductsResponse {
  items: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    rating: number;
    reviewCount: number;
    unit: string;
    isOrganic: boolean;
    isFresh: boolean;
    category: { name: string };
  }>;
}

function useMerchantProfile(id: string) {
  return useQuery({
    queryKey: ["merchant-public", id],
    queryFn: async () => {
      const res = await apiClient.get(`/merchants/${id}`);
      return unwrap<MerchantPublicProfile>(res);
    },
    enabled: !!id,
  });
}

function useMerchantProducts(merchantId: string) {
  return useQuery({
    queryKey: ["merchant-products", merchantId],
    queryFn: async () => {
      const res = await apiClient.get(`/products?merchant=${merchantId}&limit=50`);
      return unwrap<MerchantProductsResponse>(res);
    },
    enabled: !!merchantId,
  });
}

export default function SellerStorePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: merchant, isLoading: merchantLoading } = useMerchantProfile(id);
  const { data: productsData, isLoading: productsLoading } = useMerchantProducts(id);
  const products = productsData?.items || [];

  if (merchantLoading) return <PageLoading />;

  if (!merchant) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Store not found"
          description="This seller's store doesn't exist or has been removed."
          action={{ label: "Browse Products", href: "/" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Store Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Button variant="ghost" asChild className="mb-4 gap-2 -ml-2">
            <Link href="/"><ArrowLeft className="h-4 w-4" />Back</Link>
          </Button>

          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={merchant.businessLogo || ""} />
              <AvatarFallback className="text-2xl bg-brand-100 text-brand-700">
                {getInitials(merchant.businessName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{merchant.businessName}</h1>
              {merchant.businessAddress && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {merchant.businessAddress}
                </div>
              )}
              {merchant.description && (
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{merchant.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                {merchant.rating !== undefined && merchant.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{merchant.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {products.length || merchant.totalProducts || 0} products
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="mb-6 text-xl font-bold">Products</h2>
        <ProductGrid
          products={products.map((p) => ({
            ...p,
            comparePrice: 0,
            merchant: { id: merchant.id, businessName: merchant.businessName, businessLogo: merchant.businessLogo },
            quantity: 0,
            tags: [],
            reviewCount: p.reviewCount,
            deliveryTime: "",
            origin: "",
            isFrozen: false,
            status: "ACTIVE",
            createdAt: "",
          })) as any}
          isLoading={productsLoading}
          emptyMessage="This seller hasn't listed any products yet."
        />
      </div>
    </div>
  );
}
