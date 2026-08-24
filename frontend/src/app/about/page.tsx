"use client";

import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <Leaf className="mx-auto h-12 w-12 text-brand-600" />
        <h1 className="mt-4 text-4xl font-bold">About AgroTech</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Connecting Nigerian farmers directly to your table. We&apos;re building Africa&apos;s most trusted agricultural marketplace.
        </p>
      </div>
      <div className="mt-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="mt-2 text-muted-foreground">
            To empower local farmers by providing them with a digital marketplace to reach more customers, while ensuring consumers get the freshest produce at fair prices.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="mt-2 text-muted-foreground">
            Founded in 2024, AgroTech was born from the challenge of connecting Nigeria&apos;s abundant agricultural producers with urban consumers. We leverage technology to eliminate middlemen, reduce food waste, and ensure farmers earn fair value for their hard work.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Why Choose Us</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Farm-Fresh", desc: "Harvested within 24 hours of delivery" },
              { title: "Fair Prices", desc: "Direct from farmers, no middlemen" },
              { title: "Trusted Sellers", desc: "All merchants are verified" },
              { title: "Secure Payments", desc: "Protected by Paystack & Flutterwave" },
            ].map((item) => (
              <li key={item.title} className="rounded-xl border p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12 text-center">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">Start Shopping <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
