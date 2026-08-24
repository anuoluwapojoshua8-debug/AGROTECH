import { cn } from "@/lib/utils";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 text-muted-foreground/50">
        {icon || <PackageOpen className="h-16 w-16" />}
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button asChild className="mt-6" size="lg">
          {action.onClick ? (
            <button onClick={action.onClick}>{action.label}</button>
          ) : (
            <Link href={action.href}>{action.label}</Link>
          )}
        </Button>
      )}
    </div>
  );
}
