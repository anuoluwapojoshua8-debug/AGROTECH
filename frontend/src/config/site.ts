export const siteConfig = {
  name: "AgroTech",
  description: "Africa's premier marketplace for fresh farm produce. Buy directly from local farmers and get farm-fresh deliveries to your doorstep.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  contact: {
    phone: "+234 800 123 4567",
    email: "support@agrotech.ng",
    address: "42 Adeola Odeku Street, Victoria Island, Lagos, Nigeria",
    hours: "Mon - Sat, 8:00 AM - 6:00 PM WAT",
  },
};

export type SiteConfig = typeof siteConfig;
