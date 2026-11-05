import type { MetadataRoute } from "next";

// Needed for the static mobile export (BUILD_TARGET=mobile).
export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pilot-library.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
