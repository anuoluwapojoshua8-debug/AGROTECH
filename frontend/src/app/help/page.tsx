"use client";

import Link from "next/link";
import { HelpCircle, ShoppingCart, Truck, CreditCard, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "How do I place an order?", a: "Browse products, add items to your cart, and proceed to checkout. You'll need to provide a delivery address and choose a payment method." },
  { q: "What payment methods are accepted?", a: "We accept card payments (Paystack), bank transfers, and cash on delivery." },
  { q: "How long does delivery take?", a: "Most orders are delivered within 24 hours. Delivery times may vary based on your location." },
  { q: "What is the delivery fee?", a: "Delivery is free for orders above ₦15,000. A flat fee of ₦1,500 applies to orders below this amount." },
  { q: "Can I return products?", a: "If you're not satisfied with your order, please contact us within 24 hours of delivery." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-brand-600" />
        <h1 className="mt-4 text-4xl font-bold">Help Center</h1>
        <p className="mt-4 text-lg text-muted-foreground">Find answers to common questions</p>
      </div>
      <div className="mt-12 space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="rounded-2xl border bg-card">
            <summary className="cursor-pointer p-4 font-medium">{faq.q}</summary>
            <p className="border-t px-4 pb-4 pt-3 text-sm text-muted-foreground">{faq.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">Still need help?</p>
        <Button asChild variant="outline" className="mt-2 gap-2">
          <Link href="/contact">Contact Us <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
