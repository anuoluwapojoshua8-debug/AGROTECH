"use client";

import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const openings = [
  { title: "Senior Full Stack Developer", location: "Lagos, Nigeria", type: "Full-time" },
  { title: "Product Manager", location: "Lagos, Nigeria", type: "Full-time" },
  { title: "Logistics Coordinator", location: "Abuja, Nigeria", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <Briefcase className="mx-auto h-12 w-12 text-brand-600" />
        <h1 className="mt-4 text-4xl font-bold">Careers</h1>
        <p className="mt-4 text-lg text-muted-foreground">Join us in transforming agriculture in Africa</p>
      </div>
      <div className="mt-12 space-y-4">
        {openings.map((job) => (
          <div key={job.title} className="flex items-center justify-between rounded-2xl border bg-card p-6">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{job.type}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-1">
              <Link href="/contact">Apply <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
