import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchClient } from "@/components/search-client";
import { PRODUCTS } from "@/data/products";

export const metadata: Metadata = {
  title: "ค้นหา",
  description: "ค้นหาสินค้าในแคตตาล็อก PILOT Library",
};

const INDEX = PRODUCTS.map((p) => ({
  slug: p.slug,
  name: p.name,
  sku: p.sku,
  category: p.category,
  price: p.price,
  summary: p.summary,
  image: p.images[0]?.src ?? "",
  colors: (p.colors ?? []).map((c) => c.name),
  tags: p.tags,
}));

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SearchClient index={INDEX} />
      </main>
      <SiteFooter />
    </>
  );
}
