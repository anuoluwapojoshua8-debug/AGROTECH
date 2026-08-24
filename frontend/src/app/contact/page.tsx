"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";

const channels = [
  { icon: Phone, title: "Phone", desc: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}` },
  { icon: Mail, title: "Email", desc: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
  { icon: MapPin, title: "Office", desc: siteConfig.contact.address },
  { icon: MessageSquare, title: "Live Chat", desc: siteConfig.contact.hours },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent!", { description: "We'll get back to you within 24 hours." });
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">We&apos;d love to hear from you</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((ch) => (
          <div key={ch.title} className="rounded-2xl border bg-card p-4 text-center">
            <ch.icon className="mx-auto h-6 w-6 text-brand-600" />
            <h3 className="mt-2 font-medium">{ch.title}</h3>
            {ch.href ? (
              <a href={ch.href} className="mt-1 block text-xs text-brand-600 hover:underline">
                {ch.desc}
              </a>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{ch.desc}</p>
            )}
          </div>
        ))}
      </div>
      {!submitted && (
        <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-lg space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="First Name" required />
            <Input placeholder="Last Name" required />
          </div>
          <Input type="email" placeholder="Email" required />
          <Input placeholder="Subject" required />
          <Textarea placeholder="Message" rows={5} required />
          <Button type="submit" size="lg" className="w-full">Send Message</Button>
        </form>
      )}
    </div>
  );
}
