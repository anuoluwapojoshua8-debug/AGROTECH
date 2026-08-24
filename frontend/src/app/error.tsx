"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-muted-foreground">
          An unexpected error occurred. Our team has been notified. Please try again.
        </p>
      </div>
      {error.digest && (
        <p className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
