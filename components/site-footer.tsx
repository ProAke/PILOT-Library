import Link from "next/link";
import { CATEGORIES } from "@/data/products";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.top} wrap`}>
        <div className={styles.brandCol}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-word.png" alt="PILOT Library" width={168} height={48} className={styles.logo} />
          <p className={styles.blurb}>
            Products catalogue on mobile apps for iOS &amp; Android.
            <br />
            เสื้อผ้า กระเป๋า และของที่ระลึกสำหรับนักบินและผู้ที่รักการบิน
          </p>
          <a
            className={styles.contact}
            href="tel:+66816455575"
            aria-label="โทร 081-645-5575"
          >
            081-645-5575
          </a>
        </div>

        <nav className={styles.col} aria-label="สินค้า">
          <h2 className={styles.colTitle}>Shop</h2>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/shop?c=${c.slug}`} className={styles.link}>
              {c.name}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="ข้อมูล">
          <h2 className={styles.colTitle}>Library</h2>
          <Link href="/journal" className={styles.link}>
            About us
          </Link>
          <Link href="/journal#catalog" className={styles.link}>
            Data source
          </Link>
          <Link href="/search" className={styles.link}>
            Search
          </Link>
          <Link href="/inquiry" className={styles.link}>
            Inquiry bag
          </Link>
        </nav>

        <div className={styles.col}>
          <h2 className={styles.colTitle}>Visit</h2>
          <p className={styles.address}>
            PILOT Library
            <br />
            Aviation goods &amp; souvenirs
            <br />
            Bangkok, Thailand
          </p>
          <p className={styles.hours}>Open daily 10:00 – 19:00</p>
        </div>
      </div>

      <div className={`${styles.bottom} wrap`}>
        <p>© {new Date().getFullYear()} PILOT Library. All rights reserved.</p>
        <p className={styles.legal}>
          <span className="mono">iOS · Android · Web</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>Prices in THB</span>
        </p>
      </div>
    </footer>
  );
}
