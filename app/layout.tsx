import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { ServiceWorker } from "@/components/service-worker";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pilot-library.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PILOT Library — Aviation Goods",
    template: "%s · PILOT Library",
  },
  applicationName: "PILOT Library",
  description:
    "Products catalogue on mobile apps for iOS & Android — เสื้อผ้า กระเป๋า อุปกรณ์การบิน และของที่ระลึกจาก PILOT Library",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PILOT Library",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "th_TH",
    title: "PILOT Library — Aviation Goods",
    description:
      "แคตตาล็อกสินค้าสำหรับนักบินและผู้ที่รักการบิน — เสื้อผ้า กระเป๋า อุปกรณ์ และของที่ระลึก",
    images: [{ url: "/hero/og.jpg", width: 1200, height: 630 }],
  },
  icons: {
    icon: [
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/assets/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#121820" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <CartProvider>{children}</CartProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
