"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProductBuy } from "@/components/product-buy";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { CATEGORY_BY_SLUG } from "@/data/products";
import { useCatalog } from "@/lib/catalog-client";
import { driveViewUrl } from "@/lib/drive-url";
import { openExternal } from "@/lib/native";
import styles from "@/app/product/[slug]/product.module.css";

/**
 * Product detail screen. Client-side so the statically exported iOS / Android
 * bundle can resolve products from the bundled catalogue (and live Drive
 * overrides) without a server round-trip.
 */
export function ProductDetail({ slug }: { slug: string }) {
  const { products } = useCatalog();
  const product = useMemo(() => products.find((p) => p.slug === slug), [products, slug]);

  if (!product) {
    return (
      <div className={`${styles.missing} wrap`}>
        <p className="eyebrow">404</p>
        <h1>ไม่พบสินค้านี้</h1>
        <Link href="/shop" className={styles.relatedAll}>
          ไปที่แคตตาล็อก →
        </Link>
      </div>
    );
  }

  const category = CATEGORY_BY_SLUG[product.category];
  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, 4);

  return (
    <>
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
              <button
                type="button"
                className={styles.driveLink}
                onClick={() =>
                  void openExternal(driveViewUrl(product.images[0]?.driveId ?? ""))
                }
              >
                เปิดใน Google Drive ↗
              </button>
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
    </>
  );
}
