"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useLocationStore } from "@/store/location-store";
import { mainNav } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LocationPicker } from "@/components/layout/location-picker";
import { NotificationBell } from "@/components/layout/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  Sun,
  Moon,
  MapPin,
  ChevronDown,
  LogOut,
  User,
  Package,
  Settings,
  Store,
  LayoutDashboard,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const { setMobileMenuOpen, setSearchOpen } = useUIStore();
  const locationLabel = useLocationStore((s) => s.label || s.city || "Set location");
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin": return "/dashboard/admin";
      case "seller": return "/dashboard/seller";
      default: return "/dashboard/buyer";
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      {/* Top bar */}
      <div className="hidden bg-brand-600 px-4 py-1.5 text-center text-xs text-white lg:block">
        <p>Free delivery on orders above ₦15,000 | Fresh from farm to your table</p>
      </div>

      {/* Main header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Mobile menu */}
        <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="hidden text-xl font-bold sm:block">
            Agro<span className="text-brand-600">Tech</span>
          </span>
        </Link>

        {/* Location */}
        <button
          className="hidden items-center gap-1 rounded-lg border px-3 py-2 text-xs hover:bg-accent md:flex"
          onClick={() => setLocationOpen(true)}
        >
          <MapPin className="h-4 w-4 text-brand-600" />
          <span className="max-w-[100px] truncate">{locationLabel}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Search */}
        <div className="hidden flex-1 md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search className="h-4 w-4" />
            <span>Search fresh produce, groceries...</span>
            <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-xs lg:inline">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:inline-flex"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {/* Notifications */}
          <NotificationBell />

          {/* Wishlist */}
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden gap-2 sm:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                      {getInitials(`${user.firstName} ${user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline">
                    {user.firstName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buyer/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buyer/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {user.role === "seller" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/seller" className="cursor-pointer">
                        <Store className="mr-2 h-4 w-4" />
                        Seller Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile search */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Category nav */}
      <div className="hidden border-t bg-background lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors hover:text-brand-600 ${
                pathname === item.href ? "text-brand-600" : "text-muted-foreground"
              }`}
            >
              {item.title}
            </Link>
          ))}
          <div className="ml-auto">
            <Link
              href="/become-seller"
              className="whitespace-nowrap px-3 py-2 text-xs font-medium text-secondary-600 hover:text-secondary-700"
            >
              Sell on AgroTech
            </Link>
          </div>
        </div>
      </div>

      <LocationPicker open={locationOpen} onClose={() => setLocationOpen(false)} />
    </header>
  );
}
