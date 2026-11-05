import type { NextConfig } from "next";

/**
 * Two build targets share one codebase:
 *  - `next build`          → server build (web shop, JSON API, Drive bridge)
 *  - `BUILD_TARGET=mobile` → static export consumed by Capacitor for the
 *                            iOS / Android app bundles (no Node server needed)
 */
const isMobile = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Tiles are pre-optimised by scripts/prepare-images.py, so the built-in
    // optimiser is not required (keeps `next start` dependency-free).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
  ...(isMobile
    ? {
        output: "export" as const,
        trailingSlash: true,
        distDir: "out",
      }
    : {}),
  async headers() {
    if (isMobile) return [];
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/catalog/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
