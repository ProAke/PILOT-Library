import type { MetadataRoute } from "next";

// Needed for the static mobile export (BUILD_TARGET=mobile).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PILOT Library — Aviation Goods",
    short_name: "PILOT Library",
    description:
      "Products catalogue on mobile apps for iOS & Android — เสื้อผ้า กระเป๋า อุปกรณ์การบิน และของที่ระลึก",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f5f1",
    theme_color: "#f7f5f1",
    lang: "th",
    dir: "ltr",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/assets/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Apparel", url: "/shop?c=apparel" },
      { name: "Bags", url: "/shop?c=bags" },
      { name: "Accessories", url: "/shop?c=accessories" },
      { name: "Inquiry bag", url: "/inquiry" },
    ],
  };
}
