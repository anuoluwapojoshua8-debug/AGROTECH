"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { mainNav, buyerNav, sellerNav } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Leaf,
  LogOut,
  User,
  ShoppingBag,
  Heart,
  Store,
  LayoutDashboard,
  HelpCircle,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

export function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm transform bg-background shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Agro<span className="text-brand-600">Tech</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] pb-20">
          <div className="px-4 py-4">
            {/* User section */}
            {isAuthenticated && user ? (
              <div className="mb-6 rounded-2xl bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/dashboard/buyer/orders">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex gap-2">
                <Button asChild className="flex-1" size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1" size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">Shop</p>
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Dashboard links for authenticated users */}
            {isAuthenticated && user && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                    My Account
                  </p>
                  {user.role === "buyer" && buyerNav.slice(1).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                    >
                      {item.title}
                    </Link>
                  ))}
                  {user.role === "seller" && sellerNav.slice(1).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </>
            )}

            <Separator className="my-4" />

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted"
            >
              {theme === "dark" ? (
                <><Sun className="h-4 w-4" /> Light Mode</>
              ) : (
                <><Moon className="h-4 w-4" /> Dark Mode</>
              )}
            </button>

            {/* Sell link */}
            <Link
              href="/become-seller"
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-secondary-600 hover:bg-muted"
            >
              <Store className="h-4 w-4" />
              Sell on AgroTech
            </Link>

            <Separator className="my-4" />

            {/* Logout */}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
