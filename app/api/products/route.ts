import { NextResponse } from "next/server";
import { getLiveCatalog } from "@/lib/drive";
import { safeSearchParams } from "@/lib/request-params";

export const revalidate = 600;
export const dynamic = "force-static";

/**
 * GET /api/products
 * GET /api/products?category=apparel&q=umbrella
 *
 * The public catalogue endpoint consumed by the iOS / Android shells.
 * Photos are resolved from the connected Google Drive folder when
 * GOOGLE_DRIVE_API_KEY is present, otherwise the bundled snapshot is used.
 */
export async function GET(request: Request) {
  const searchParams = safeSearchParams(request);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const catalog = await getLiveCatalog();

  let products = catalog.products;
  if (category && category !== "all") {
    products = products.filter((p) => p.category === category);
  }
  if (q) {
    products = products.filter((p) =>
      [p.name, p.nameEn, p.sku, p.summary, p.description, ...(p.colors ?? []).map((c) => c.name)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  return NextResponse.json(
    {
      app: "PILOT Library",
      version: 1,
      source: catalog.source,
      checkedAt: catalog.checkedAt,
      drive: {
        folderId: catalog.folder.folderId,
        folderUrl: catalog.folder.folderUrl,
        configured: catalog.folder.configured,
        error: catalog.driveError,
      },
      count: products.length,
      categories: catalog.categories,
      products: products.map((p) => ({
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
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
