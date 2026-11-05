import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductDetail } from "@/components/product-detail";
import { PRODUCTS } from "@/data/products";

type Params = Promise<{ slug: string }>;

export const revalidate = 600;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const base = PRODUCTS.find((p) => p.slug === slug);
  if (!base) return { title: "ไม่พบสินค้า" };
  return {
    title: base.name,
    description: base.description,
    openGraph: {
      title: `${base.name} · PILOT Library`,
      description: base.summary,
      images: [{ url: base.images[0]?.src ?? "/hero/og.jpg" }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  return (
    <>
      <SiteHeader />
      <main>
        <ProductDetail slug={slug} />
      </main>
      <SiteFooter />
    </>
  );
}
