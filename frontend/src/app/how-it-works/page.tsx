"use client";

import Link from "next/link";
import { Search, ShoppingCart, Package, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Search, title: "Browse Products", desc: "Explore fresh produce from verified local farmers and merchants." },
  { icon: ShoppingCart, title: "Place Your Order", desc: "Add items to your cart and checkout securely." },
  { icon: Package, title: "We Process", desc: "The farmer prepares your order fresh from the farm." },
  { icon: Truck, title: "Fast Delivery", desc: "Get your order delivered to your doorstep within 24 hours." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">How It Works</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Getting fresh farm produce delivered to your door is simple
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {steps.map((step, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950">
              <step.icon className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">Get Started <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
