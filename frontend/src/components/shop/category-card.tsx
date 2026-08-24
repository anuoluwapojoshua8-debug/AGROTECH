"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    productCount?: number;
    icon?: string;
  };
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group relative flex flex-col items-center overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      {/* Image */}
      <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="80px"
        />
      </div>
      {/* Name */}
      <h3 className="text-sm font-semibold text-center group-hover:text-brand-600 transition-colors">
        {category.name}
      </h3>
      {/* Count */}
      {category.productCount !== undefined && (
        <p className="mt-1 text-xs text-muted-foreground">
          {category.productCount} {category.productCount === 1 ? "item" : "items"}
        </p>
      )}
      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-2xl bg-brand-600/0 transition-colors duration-300 group-hover:bg-brand-600/5" />
    </Link>
  );
}
