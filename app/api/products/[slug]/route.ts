import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { getLiveCatalog } from "@/lib/drive";

export const revalidate = 600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!PRODUCTS.some((p) => p.slug === slug)) {
    return NextResponse.json({ error: "not_found", slug }, { status: 404 });
  }

  const catalog = await getLiveCatalog();
  const product = catalog.products.find((p) => p.slug === slug);
  if (!product) {
    return NextResponse.json({ error: "not_found", slug }, { status: 404 });
  }

  const related = catalog.products
    .filter((p) => p.category === product.category && p.slug !== slug)
    .slice(0, 4)
    .map((p) => ({ slug: p.slug, name: p.name, image: p.images[0]?.src, price: p.price }));

  return NextResponse.json(
    {
      source: catalog.source,
      checkedAt: catalog.checkedAt,
      product,
      related,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
