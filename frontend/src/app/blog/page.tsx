"use client";

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const posts = [
  { title: "The Benefits of Eating Seasonal Produce", excerpt: "Discover why eating fruits and vegetables in season is better for your health and wallet.", date: "Jul 15, 2024", slug: "benefits-seasonal-produce" },
  { title: "How to Start a Successful Farm Business", excerpt: "Tips and strategies for aspiring agripreneurs in Nigeria.", date: "Jul 10, 2024", slug: "start-farm-business" },
  { title: "Understanding Organic Certification", excerpt: "What does organic really mean? A guide to certification standards.", date: "Jul 5, 2024", slug: "organic-certification-guide" },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">Stories, guides, and insights from the AgroTech team</p>
      </div>
      <div className="mt-12 space-y-6">
        {posts.map((post) => (
          <div key={post.slug} className="rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {post.date}
            </div>
            <h2 className="mt-2 text-xl font-bold">{post.title}</h2>
            <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
            <Button variant="ghost" asChild className="mt-4 gap-1 p-0">
              <Link href={`/blog/${post.slug}`}>Read More <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
