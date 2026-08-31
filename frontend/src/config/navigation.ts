export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Fresh Produce", href: "/categories/fresh-produce" },
  { title: "Organic", href: "/categories/organic" },
  { title: "Meat & Fish", href: "/categories/meat-fish" },
  { title: "Dairy & Eggs", href: "/categories/dairy-eggs" },
  { title: "Beverages", href: "/categories/beverages" },
  { title: "Grains & Staples", href: "/categories/grains-staples" },
];

export const buyerNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/buyer", icon: "LayoutDashboard" },
  { title: "My Orders", href: "/dashboard/buyer/orders", icon: "ShoppingBag" },
  { title: "Wallet", href: "/dashboard/buyer/wallet", icon: "Wallet" },
  { title: "Referrals", href: "/dashboard/referrals", icon: "Gift" },
  { title: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
  { title: "Addresses", href: "/dashboard/buyer/addresses", icon: "MapPin" },
  { title: "Support", href: "/dashboard/buyer/support", icon: "Headphones" },
  { title: "Settings", href: "/dashboard/buyer/settings", icon: "Settings" },
];

export const sellerNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/seller", icon: "LayoutDashboard" },
  { title: "My Products", href: "/dashboard/seller/products", icon: "Package" },
  { title: "Orders", href: "/dashboard/seller/orders", icon: "ShoppingBag" },
  { title: "Earnings", href: "/dashboard/seller/earnings", icon: "Wallet" },
  { title: "Withdrawal", href: "/dashboard/seller/withdrawal", icon: "Banknote" },
  { title: "Referrals", href: "/dashboard/referrals", icon: "Gift" },
  { title: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
  { title: "Settings", href: "/dashboard/seller/settings", icon: "Settings" },
];

export const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/admin", icon: "LayoutDashboard" },
  { title: "Users", href: "/dashboard/admin/users", icon: "Users" },
  { title: "Merchants", href: "/dashboard/admin/merchants", icon: "Store" },
  { title: "Products", href: "/dashboard/admin/products", icon: "Package" },
  { title: "Orders", href: "/dashboard/admin/orders", icon: "ShoppingBag" },
  { title: "Transactions", href: "/dashboard/admin/transactions", icon: "CreditCard" },
  { title: "Deliveries", href: "/dashboard/admin/deliveries", icon: "Truck" },
  { title: "Coupons", href: "/dashboard/admin/coupons", icon: "Tag" },
  { title: "Analytics", href: "/dashboard/admin/analytics", icon: "BarChart3" },
  { title: "Banners", href: "/dashboard/admin/banners", icon: "Image" },
  { title: "Support", href: "/dashboard/admin/support", icon: "Headphones" },
  { title: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: "Shield" },
  { title: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
];

export const riderNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/rider", icon: "LayoutDashboard" },
  { title: "Deliveries", href: "/dashboard/rider", icon: "Truck" },
  { title: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
];
