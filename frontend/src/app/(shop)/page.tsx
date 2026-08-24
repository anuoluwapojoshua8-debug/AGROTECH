"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ArrowRight, Leaf, Truck, ShieldCheck, Headphones, ShoppingBag, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductGrid } from "@/components/shop/product-grid";
import { CategoryCard } from "@/components/shop/category-card";
import { useFeaturedProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const heroSlides = [
  {
    title: "Fresh From Farm",
    subtitle: "To Your Table",
    description: "Discover the freshest produce directly from local farmers across Nigeria.",
    cta: "Shop Now",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
    color: "from-brand-900 to-dark-900",
  },
  {
    title: "Organic Guaranteed",
    subtitle: "100% Natural",
    description: "Certified organic products grown without harmful chemicals. Taste the difference.",
    cta: "Explore Organic",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=1200&q=80",
    color: "from-secondary-900 to-dark-900",
  },
  {
    title: "Weekend Special",
    subtitle: "Up to 40% Off",
    description: "Enjoy massive discounts on selected farm produce this weekend only.",
    cta: "View Deals",
    image: "https://images.unsplash.com/photo-1590779033100-9d90a2a13e5c?w=1200&q=80",
    color: "from-earth-800 to-dark-900",
  },
];

const categories = [
  { id: "1", name: "Fresh Vegetables", slug: "fresh-vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80", productCount: 45 },
  { id: "2", name: "Organic Fruits", slug: "organic-fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80", productCount: 32 },
  { id: "3", name: "Meat & Poultry", slug: "meat-poultry", image: "https://images.unsplash.com/photo-1603048297172-c92544798d2e?w=200&q=80", productCount: 28 },
  { id: "4", name: "Dairy & Eggs", slug: "dairy-eggs", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80", productCount: 20 },
  { id: "5", name: "Fresh Fish", slug: "fresh-fish", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=200&q=80", productCount: 18 },
  { id: "6", name: "Grains & Staples", slug: "grains-staples", image: "https://images.unsplash.com/photo-1594375698290-e60e5e29bf9c?w=200&q=80", productCount: 35 },
];

const featuredProducts = [
  { id: "f1", name: "Fresh Organic Tomatoes", price: 2500, comparePrice: 3500, images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80"], unit: "basket", rating: 4.8, reviewCount: 124, deliveryTime: "24hrs", isOrganic: true, isFresh: true, quantity: 50 },
  { id: "f2", name: "Scottish Irish Potatoes", price: 4500, comparePrice: 5500, images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80"], unit: "10kg bag", rating: 4.6, reviewCount: 89, deliveryTime: "24hrs", isFresh: true, quantity: 30 },
  { id: "f3", name: "Free Range Chicken Eggs", price: 3200, comparePrice: 0, images: ["https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80"], unit: "crate", rating: 4.9, reviewCount: 203, deliveryTime: "12hrs", isOrganic: true, quantity: 100 },
  { id: "f4", name: "Fresh Catfish", price: 5500, comparePrice: 7000, images: ["https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80"], unit: "kg", rating: 4.7, reviewCount: 67, deliveryTime: "24hrs", isFresh: true, isFrozen: false, quantity: 40 },
  { id: "f5", name: "Green Bell Peppers", price: 1800, comparePrice: 2500, images: ["https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80"], unit: "bunch", rating: 4.5, reviewCount: 45, deliveryTime: "24hrs", isFresh: true, isOrganic: true, quantity: 60 },
];

const trustItems = [
  { icon: Leaf, title: "100% Fresh", desc: "Harvested within 24 hours of delivery" },
  { icon: Truck, title: "Free Delivery", desc: "On orders above ₦15,000" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "Protected by Paystack" },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help anytime" },
];

export default function HomePage() {
  const { data: apiProducts, isLoading } = useFeaturedProducts();
  const { data: apiCategories } = useCategories();
  const displayProducts = apiProducts?.length ? (apiProducts as any) : featuredProducts;
  const displayCategories = apiCategories?.length
    ? apiCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image || "",
        productCount: c._count?.products || 0,
      }))
    : categories;

  return (
    <div className="min-h-screen">
      {/* Hero Banner Carousel */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="h-[300px] sm:h-[400px] lg:h-[500px]"
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className={`relative flex h-full items-center bg-gradient-to-r ${slide.color}`}>
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover opacity-40"
                    priority={i === 0}
                  />
                </div>
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                  <div className="max-w-2xl">
                    <Badge variant="secondary" className="mb-4">
                      {slide.subtitle}
                    </Badge>
                    <h1 className="text-3xl font-bold text-white sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mt-4 text-base text-gray-300 sm:text-lg">
                      {slide.description}
                    </p>
                    <Button size="lg" className="mt-6 gap-2" asChild>
                      <Link href="/categories/fresh-vegetables">
                        {slide.cta} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Find exactly what you&apos;re craving</p>
          </div>
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/categories">View All <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {displayCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">Handpicked just for you</p>
            </div>
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/search">View All <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <ProductGrid products={displayProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* Deal Banner */}
      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-secondary-600 to-secondary-800 p-8 sm:p-12">
          <div className="relative z-10">
            <Badge variant="secondary" className="mb-4">Limited Offer</Badge>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Get 20% Off Your First Order
            </h2>
            <p className="mt-2 max-w-lg text-secondary-100">
              Use code <span className="rounded-lg bg-white/20 px-3 py-1 font-mono font-bold">FRESH20</span> at checkout
            </p>
            <Button size="lg" variant="secondary" className="mt-6" asChild>
              <Link href="/search">Shop Now</Link>
            </Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
            <Leaf className="h-full w-full" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">Why Choose AgroTech?</h2>
            <p className="mt-1 text-sm text-muted-foreground">We make farm-fresh delivery simple</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 to-dark-900 p-8 sm:p-12">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white">Get the AgroTech App</h2>
              <p className="mt-2 text-gray-400">
                Order fresh produce on the go. Available on iOS and Android.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Apple className="h-5 w-5" />
                  App Store
                </Button>
                <Button variant="outline" size="lg" className="gap-2 border-white/20 text-white hover:text-white">
                  <ShoppingBag className="h-5 w-5" />
                  Google Play
                </Button>
              </div>
            </div>
            <div className="relative h-64 w-64">
              <Image
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80"
                alt="AgroTech App"
                fill
                className="rounded-3xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold">Stay Fresh</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Subscribe to get notified about new products and deals
          </p>
          <div className="mt-6 flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button className="gap-2">
              Subscribe <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
