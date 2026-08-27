"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const blogPosts: Record<string, {
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string[];
}> = {
  "benefits-seasonal-produce": {
    title: "The Benefits of Eating Seasonal Produce",
    date: "Jul 15, 2024",
    readTime: "5 min read",
    tags: ["Health", "Seasonal", "Farm Fresh"],
    content: [
      "Eating seasonal produce is one of the simplest ways to improve your diet while supporting local farmers. When fruits and vegetables are in season, they're at their peak flavor, nutritional value, and affordability.",
      "Seasonal produce travels shorter distances from farm to table, which means it's fresher and retains more nutrients. Out-of-season produce often needs to be picked early and transported long distances, losing vital nutrients along the way.",
      "Here in Nigeria, we're blessed with a diverse climate that allows us to grow a wide variety of produce year-round. Understanding what's in season helps you make smarter shopping decisions.",
      "In the rainy season (April-October), you'll find an abundance of leafy vegetables, tomatoes, peppers, and root vegetables. The dry season brings citrus fruits, watermelons, and groundnuts.",
      "By choosing seasonal produce, you're not just eating better — you're also reducing your carbon footprint and supporting the local agricultural economy. It's a win-win for your health, your wallet, and the planet.",
    ],
  },
  "start-farm-business": {
    title: "How to Start a Successful Farm Business",
    date: "Jul 10, 2024",
    readTime: "7 min read",
    tags: ["Business", "Agripreneur", "Getting Started"],
    content: [
      "Nigeria's agricultural sector presents enormous opportunities for aspiring entrepreneurs. With a growing population and increasing demand for food, starting a farm business has never been more promising.",
      "The first step is identifying your niche. Do you want to focus on crop farming, livestock, aquaculture, or perhaps a combination? Research the market demand in your area and identify gaps you can fill.",
      "Start small and scale gradually. Many successful agripreneurs started with just a small plot of land and grew their operations over time. This approach allows you to learn the business without taking on excessive risk.",
      "Secure proper financing. There are several agricultural loans and grants available in Nigeria, including the Central Bank's Anchor Borrowers Programme and various state-level initiatives.",
      "Embrace technology. Modern farming tools, from mobile apps for crop monitoring to automated irrigation systems, can significantly improve your productivity and reduce costs.",
      "Most importantly, connect with other farmers and join agricultural cooperatives. The knowledge and support you gain from the community is invaluable for your success.",
    ],
  },
  "organic-certification-guide": {
    title: "Understanding Organic Certification",
    date: "Jul 5, 2024",
    readTime: "6 min read",
    tags: ["Organic", "Certification", "Guide"],
    content: [
      "As consumers become more health-conscious, the demand for organic produce continues to grow. But what does 'organic' really mean, and how can farmers achieve certification?",
      "Organic farming is a method of production that avoids the use of synthetic fertilizers, pesticides, and genetically modified organisms. Instead, it relies on natural processes, biodiversity, and cycles adapted to local conditions.",
      "In Nigeria, the National Agency for Food and Drug Administration and Control (NAFDAC) oversees organic certification. The process involves a thorough assessment of farming practices, soil management, and pest control methods.",
      "To become certified organic, farmers must follow a three-year transition period where they gradually eliminate prohibited substances from their farming practices. During this time, the land must be managed according to organic standards.",
      "The benefits of organic certification include premium prices for products, access to export markets, improved soil health, and reduced environmental impact. Many consumers are willing to pay 20-30% more for certified organic produce.",
      "If you're considering organic farming, start by educating yourself on the standards, connect with certified organic farmers in your area, and develop a transition plan that works for your operation.",
    ],
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Post not found</h1>
          <p className="mt-4 text-muted-foreground">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild className="mt-6">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Button variant="ghost" asChild className="mb-6 gap-2 -ml-2">
          <Link href="/blog"><ArrowLeft className="h-4 w-4" />Back to Blog</Link>
        </Button>

        <article>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
            {post.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="mt-12 rounded-2xl border bg-card p-8 text-center">
          <h2 className="text-xl font-bold">Found this helpful?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Share it with other farmers and food lovers.</p>
          <Button asChild className="mt-4">
            <Link href="/blog">Read More Articles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
