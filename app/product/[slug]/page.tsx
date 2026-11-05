import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductBuy } from "@/components/product-buy";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { CATEGORY_BY_SLUG, PRODUCTS } from "@/data/products";
import { getLiveCatalog, getDriveConfig, driveImageUrl, driveViewUrl } from "@/lib/drive";
import styles from "./product.module.css";

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
  const { products } = await getLiveCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const category = CATEGORY_BY_SLUG[product.category];
  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, 4);
  const drive = getDriveConfig();

  return (
    <>
      <SiteHeader />
      <main>
        <nav className={`${styles.crumbs} wrap`} aria-label="breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/shop?c=${category.slug}`}>{category.name}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className={`${styles.layout} wrap`}>
          <ProductGallery images={product.images} name={product.name} />

          <div className={styles.info}>
            <p className="eyebrow">
              {category.name} · {product.sku}
            </p>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.summary}>{product.summary}</p>

            <ProductBuy product={product} />

            <div className={styles.copy}>
              <h2 className={styles.copyTitle}>รายละเอียด</h2>
              <p>{product.description}</p>
            </div>

            <dl className={styles.specs}>
              {product.specs.map((spec) => (
                <div key={spec.label} className={styles.specRow}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
              <div className={styles.specRow}>
                <dt>รหัสสินค้า</dt>
                <dd className="mono">{product.sku}</dd>
              </div>
              <div className={styles.specRow}>
                <dt>จัดส่ง</dt>
                <dd>ไปรษณีย์ไทย / Kerry · 1–3 วันทำการ</dd>
              </div>
            </dl>

            <div className={styles.driveCard}>
              <div>
                <p className="eyebrow">Source asset</p>
                <p className={styles.driveName}>{product.driveFile}</p>
              </div>
              <div className={styles.driveActions}>
                <a
                  href={driveViewUrl(product.images[0]?.driveId ?? drive.folderId)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.driveLink}
                >
                  เปิดใน Google Drive ↗
                </a>
                {product.liveImages && (
                  <a
                    href={driveImageUrl(product.images[0].driveId, 2000)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.driveLink}
                  >
                    รูปต้นฉบับ ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className={`${styles.related} wrap`} aria-labelledby="related-title">
          <div className={styles.relatedHead}>
            <h2 id="related-title" className={styles.relatedTitle}>
              Complete the flight
            </h2>
            <Link href={`/shop?c=${category.slug}`} className={styles.relatedAll}>
              ดูทั้งหมด →
            </Link>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
