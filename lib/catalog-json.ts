/**
 * Catalogue JSON used by the static (native) export.
 *
 * The web build answers /api/products dynamically; the iOS / Android bundle is
 * a plain static export, so the same payload is produced at build time and
 * written to `out/api/products[.json]` by scripts/postbuild-mobile.mjs.
 */
import { CATEGORIES, PRODUCTS } from "@/data/products";

export function catalogPayload() {
  return {
    app: "PILOT Library",
    version: 1,
    source: "bundled" as const,
    count: PRODUCTS.length,
    categories: CATEGORIES,
    products: PRODUCTS.map((p) => ({
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price,
      currency: "THB",
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      summary: p.summary,
      description: p.description,
      specs: p.specs,
      tags: p.tags,
      images: p.images,
      driveFile: p.driveFile,
      updatedAt: p.updatedAt,
      url: `/product/${p.slug}`,
    })),
  };
}
