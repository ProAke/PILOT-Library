import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { CategoryTabs } from "@/components/category-tabs";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/products";
import { getLiveCatalog } from "@/lib/drive";
import { formatThaiDate } from "@/lib/format";
import styles from "./page.module.css";

export const revalidate = 600;

const HOME_TABS = [
  { key: "all", label: "All", href: "/" },
  { key: "apparel", label: "Mens", href: "/shop?c=apparel" },
  { key: "accessories", label: "Womens", href: "/shop?c=accessories" },
  { key: "souvenirs", label: "Objects", href: "/shop?c=souvenirs" },
];

export default async function HomePage() {
  const { products, source, folder, checkedAt } = await getLiveCatalog();
  const visible = products.length > 0 ? products : PRODUCTS;

  return (
    <>
      <SiteHeader />
      <main>
        <Hero
          eyebrow="New Arrivals"
          title="Flight Deck Essentials"
          caption="Bag · Lanyard · Key tag · ตรงจากโรงงานสู่มือคุณ"
          href="/shop?c=accessories"
          cta="Learn more"
        />

        <CategoryTabs tabs={HOME_TABS} active="all" />

        <section className={styles.gridSection} aria-labelledby="catalog-title">
          <div className={`${styles.gridHead} wrap`}>
            <h2 id="catalog-title" className="visually-hidden">
              สินค้าทั้งหมด
            </h2>
            <p className={styles.count}>
              <span className="mono">{String(visible.length).padStart(2, "0")}</span> products
            </p>
            <p className={styles.source}>
              <span className={`${styles.dot} ${source === "drive" ? styles.dotLive : ""}`} aria-hidden="true" />
              {source === "drive" ? "Live from Google Drive" : "Catalogue snapshot"}
              <span className={styles.sourceDate}>· {formatThaiDate(checkedAt)}</span>
            </p>
          </div>

          <div className={`${styles.grid} wrap`}>
            {visible.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </section>

        <section className={styles.strip} aria-label="จุดเด่น">
          {[
            { k: "01", t: "Made for crew", d: "ออกแบบร่วมกับลูกเรือจริง ใช้ได้ทุกวัน" },
            { k: "02", t: "Small batch", d: "ผลิตเป็นล็อตเล็ก ควบคุมคุณภาพทุกชิ้น" },
            { k: "03", t: "Ships worldwide", d: "จัดส่งทั่วไทยและต่างประเทศ" },
          ].map((item) => (
            <div key={item.k} className={styles.stripItem}>
              <span className="mono">{item.k}</span>
              <h3>{item.t}</h3>
              <p>{item.d}</p>
            </div>
          ))}
        </section>

        <section className={`${styles.apiNote} wrap`}>
          <div>
            <p className="eyebrow">Catalogue API</p>
            <h2 className={styles.apiTitle}>Drive-backed product data</h2>
            <p className={styles.apiBody}>
              รายการสินค้าทั้งหมดเชื่อมกับโฟลเดอร์ Google Drive
              &ldquo;Pilot-library&rdquo; ผ่าน API — รูปสินค้าและข้อมูลอัปเดตได้จากที่เดียว
            </p>
          </div>
          <div className={styles.apiBox}>
            <p className="mono">
              <span className={styles.apiKey}>GET</span> /api/products
            </p>
            <p className={`mono ${styles.apiDim}`}>status: {folder.configured ? "connected" : "local snapshot"}</p>
            <Link href="/journal#catalog" className={styles.apiLink}>
              วิธีเชื่อมต่อข้อมูล →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
