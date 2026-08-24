"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Phone, ArrowRight, Leaf } from "lucide-react";

const footerLinks = {
  quickLinks: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Become a Seller", href: "/become-seller" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  categories: [
    { label: "Fresh Produce", href: "/categories/fresh-produce" },
    { label: "Organic Foods", href: "/categories/organic" },
    { label: "Meat & Fish", href: "/categories/meat-fish" },
    { label: "Dairy & Eggs", href: "/categories/dairy-eggs" },
    { label: "Beverages", href: "/categories/beverages" },
    { label: "Grains & Staples", href: "/categories/grains-staples" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-dark-950 text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="flex-1">
              <h3 className="text-2xl font-bold">
                Stay <span className="text-brand-400">Fresh</span> with Us
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Subscribe to get updates on new products, exclusive deals, and farm stories.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus-visible:ring-brand-500"
              />
              <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Agro<span className="text-brand-400">Tech</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Africa&apos;s premier marketplace connecting you directly with local farmers.
              Fresh produce, fair prices, fast delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-brand-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Categories</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-brand-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-brand-400">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-brand-400">
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-gray-500 md:flex-row">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <div className="flex gap-4">
          {footerLinks.support.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-400">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
