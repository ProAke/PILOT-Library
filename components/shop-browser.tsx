"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CategoryTabs } from "@/components/category-tabs";
import { ProductCard } from "@/components/product-card";
import { ShopToolbar } from "@/components/shop-toolbar";
import { CATEGORIES, PRODUCTS, type CategorySlug } from "@/data/products";
import styles from "@/app/shop/shop.module.css";

const TABS = [
  { key: "all", label: "All", href: "/shop" },
  ...CATEGORIES.map((c) => ({ key: c.slug, label: c.name, href: `/shop?c=${c.slug}` })),
];

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "name", label: "A–Z" },
];

/**
 * Catalogue browser. Runs client-side so the same screen works in the
 * statically exported mobile bundle and on the web (server) build.
 */
export function ShopBrowser() {
  const params = useSearchParams();
  const c = params.get("c") ?? undefined;
  const sort = params.get("sort") ?? "featured";

  const active = (CATEGORIES.some((x) => x.slug === c) ? c : "all") as CategorySlug | "all";
  const category = CATEGORIES.find((x) => x.slug === active);

  const list = useMemo(() => {
    const base = active === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);
    return [...base].sort((a, b) => {
      if (sort === "price-asc") return (a.price ?? 1e9) - (b.price ?? 1e9);
      if (sort === "price-desc") return (b.price ?? -1) - (a.price ?? -1);
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [active, sort]);

  return (
    <>
      <header className={`${styles.head} wrap`}>
        <p className="eyebrow">{active === "all" ? "Catalogue" : category?.nameTh}</p>
        <h1 className={styles.title}>
          {active === "all" ? "All goods" : category?.name}
          <span className={styles.titleCount}>({String(list.length).padStart(2, "0")})</span>
        </h1>
        <p className={styles.blurb}>
          {active === "all"
            ? "ทุกหมวดรวมไว้ที่นี่ — เสื้อผ้า กระเป๋า อุปกรณ์การบิน และของที่ระลึก"
            : category?.blurb}
        </p>
      </header>

      <CategoryTabs tabs={TABS} active={active} />
      <ShopToolbar sorts={SORTS} active={sort} total={list.length} />

      <section className={`${styles.grid} wrap`} aria-live="polite">
        {list.map((product, i) => (
          <ProductCard key={product.slug} product={product} index={i} />
        ))}
      </section>

      {list.length === 0 && (
        <div className={`${styles.empty} wrap`}>
          <p>ยังไม่มีสินค้าในหมวดนี้</p>
          <Link href="/shop">ดูสินค้าทั้งหมด →</Link>
        </div>
      )}

      <nav className={`${styles.otherCats} wrap`} aria-label="หมวดอื่น ๆ">
        {CATEGORIES.filter((x) => x.slug !== active).map((cat) => (
          <Link key={cat.slug} href={`/shop?c=${cat.slug}`} className={styles.otherCard}>
            <span className="mono">{cat.slug}</span>
            <h2>{cat.name}</h2>
            <p>{cat.blurb}</p>
            <span className={styles.otherArrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
