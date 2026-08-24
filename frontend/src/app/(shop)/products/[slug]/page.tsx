"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, Star, Minus, Plus, ShoppingCart, Truck, Leaf, Clock, MapPin, Store, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductGrid } from "@/components/shop/product-grid";
import { PageLoading } from "@/components/shared/loading";
import { formatPrice, formatDate, calculateDiscount, getInitials } from "@/lib/utils";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useToggleWishlist, useWishlist } from "@/hooks/use-wishlist";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist(isAuthenticated);
  const { data: product, isLoading } = useProduct(slug);
  const { data: relatedProducts } = useRelatedProducts(product?.id || "");
  const discount = calculateDiscount(product?.price || 0, product?.comparePrice || 0);
  const isWishlisted = wishlist?.some((p) => p.id === product?.id) || false;

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity,
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
      toast.success("Added to cart!", {
        description: `${quantity}x ${product.name} added to your cart.`,
      });
    } catch {
      toast.error("Could not add to cart", {
        description: "Please try again.",
      });
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await toggleWishlist.mutateAsync(product.id);
    } catch {
      // ignore
    }
  };

  if (isLoading || !product) return <PageLoading />;

  const comparePrice = product.comparePrice ?? 0;
  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const reviews = product.reviews || [];
  const seller = product.merchant;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
            {product.category.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-all duration-500"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
                {product.isOrganic && <Badge variant="organic"><Leaf className="mr-1 h-3 w-3" />Organic</Badge>}
                {product.isFresh && <Badge variant="fresh">Fresh</Badge>}
              </div>
              <button
                onClick={handleToggleWishlist}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-dark-800/80"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"}`} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      i === selectedImage ? "border-brand-600 ring-1 ring-brand-600" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-brand-600">
                {formatPrice(product.price)}
              </span>
              {comparePrice > 0 && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(comparePrice)}
                  </span>
                  <Badge variant="destructive">Save {formatPrice(comparePrice - product.price)}</Badge>
                </>
              )}
              <span className="text-sm text-muted-foreground">/ per {product.unit}</span>
            </div>

            <Separator />

            {/* Description */}
            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-brand-600" />
                <span>Organic: <strong>{product.isOrganic ? "Yes" : "No"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-brand-600" />
                <span>Delivery: <strong>{product.deliveryTime}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>Origin: <strong>{product.origin}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-brand-600" />
                <span>Stock: <strong>{product.quantity} {product.unit}s</strong></span>
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex items-center gap-1 rounded-xl border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-l-xl transition-colors hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-12 w-16 items-center justify-center text-base font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-r-xl transition-colors hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} loading={addToCart.isPending}>
                <ShoppingCart className="h-5 w-5" />
                Add to Cart — {formatPrice(product.price * quantity)}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleToggleWishlist}>
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            {/* Delivery info */}
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="font-medium">Free delivery on orders above ₦15,000</p>
                  <p className="text-muted-foreground">Estimated delivery: within {product.deliveryTime}</p>
                </div>
              </div>
            </div>

            {/* Seller */}
            {seller && (
              <div className="flex items-center gap-3 rounded-2xl border p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={seller.businessLogo || ""} />
                  <AvatarFallback className="bg-brand-100 text-brand-700">
                    {getInitials(seller.businessName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{seller.businessName}</p>
                  <p className="text-xs text-muted-foreground">Seller</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href={`/sellers/${seller.id}`}>View Store</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="mt-12">
          <TabsList>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="space-y-4 pt-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user?.avatar || ""} />
                        <AvatarFallback>{getInitials(`${review.user?.firstName || ""} ${review.user?.lastName || ""}`)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user?.firstName} {review.user?.lastName}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm">{review.comment}</p>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="shipping" className="pt-4">
            <div className="rounded-2xl border p-6 space-y-3 text-sm">
              <p><strong>Delivery Time:</strong> Within {product.deliveryTime} of ordering</p>
              <p><strong>Delivery Area:</strong> We deliver to all major cities in Nigeria</p>
              <p><strong>Free Delivery:</strong> On orders above ₦15,000</p>
              <p><strong>Returns:</strong> If you're not satisfied, contact us within 24 hours of delivery</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <ProductGrid products={relatedProducts || []} emptyMessage="No related products found." />
        </section>
      </div>
    </div>
  );
}
