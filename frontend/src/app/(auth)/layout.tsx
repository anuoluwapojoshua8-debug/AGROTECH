import { Leaf } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/25">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold">
            Agro<span className="text-brand-600">Tech</span>
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
