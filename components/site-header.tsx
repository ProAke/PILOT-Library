"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { CATEGORIES } from "@/data/products";
import styles from "./site-header.module.css";

const NAV = [
  { href: "/shop?c=apparel", label: "Men", key: "apparel" },
  { href: "/shop?c=accessories", label: "Women", key: "accessories" },
  { href: "/shop?c=souvenirs", label: "Objects", key: "souvenirs" },
  { href: "/journal", label: "Journal", key: "journal" },
  { href: "/demo", label: "Demo", key: "demo" },
];

/**
 * useSearchParams() needs a Suspense boundary so static pages can still be
 * prerendered — the header falls back to the no-JS version for a frame.
 */
export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderShell />}>
      <SiteHeaderInner />
    </Suspense>
  );
}

function SiteHeaderInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCat = params.get("c");
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCondensed(y > 8);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, params]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`${styles.header} ${condensed ? styles.condensed : ""}`}>
      <div className={`${styles.bar} wrap`}>
        <Link href="/" className={styles.brand} aria-label="PILOT Library — หน้าแรก">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-word.png"
            alt="PILOT"
            width={188}
            height={54}
            className={styles.wordmark}
          />
          <span className={styles.brandSub}>Library</span>
        </Link>

        <nav className={styles.nav} aria-label="หมวดหมู่สินค้า">
          {NAV.map((item) => {
            const isActive =
              item.key === "journal"
                ? pathname.startsWith("/journal")
                : item.key === "demo"
                  ? pathname.startsWith("/demo")
                  : pathname.startsWith("/shop") && activeCat === item.key;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.tools}>
          <Link href="/search" className={styles.tool} aria-label="ค้นหา">
            <SearchIcon />
            <span className={styles.toolLabel}>Search</span>
          </Link>
          <span className={styles.divider} aria-hidden="true" />
          <Link href="/journal" className={styles.tool}>
            About us
          </Link>
          <Link href="/inquiry" className={styles.tool} aria-label="รายการที่สนใจ">
            <BagIcon />
            <span className={styles.toolLabel}>Bag</span>
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </Link>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          >
            <span className={open ? styles.burgerOpen : styles.burger} />
          </button>
        </div>
      </div>

      <div className={`${styles.mobileSheet} ${open ? styles.mobileSheetOpen : ""}`}>
        <nav className={styles.mobileNav} aria-label="เมนูมือถือ">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.slug} href={`/shop?c=${cat.slug}`} className={styles.mobileLink}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <span>{cat.name}</span>
              <em>{cat.nameTh}</em>
            </Link>
          ))}
          <Link href="/journal" className={styles.mobileLink}>
            <span className="mono">05</span>
            <span>Journal</span>
            <em>เรื่องราวการบิน</em>
          </Link>
          <Link href="/demo" className={styles.mobileLink}>
            <span className="mono">06</span>
            <span>Demo on phone</span>
            <em>ทดลองบนมือถือจริง</em>
          </Link>
          <Link href="/inquiry" className={styles.mobileLink}>
            <span className="mono">07</span>
            <span>Bag</span>
            <em>รายการที่สนใจ ({count})</em>
          </Link>
        </nav>
        <p className={styles.mobileFoot}>
          PILOT Library — Aviation goods
          <br />
          <span className="mono">LINE @pilotlibrary · 081-645-5575</span>
        </p>
      </div>
    </header>
  );
}

function HeaderShell() {
  return (
    <header className={styles.header}>
      <div className={`${styles.bar} wrap`}>
        <Link href="/" className={styles.brand} aria-label="PILOT Library — หน้าแรก">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-word.png" alt="PILOT" width={188} height={54} className={styles.wordmark} />
          <span className={styles.brandSub}>Library</span>
        </Link>
        <nav className={styles.nav} aria-label="หมวดหมู่สินค้า">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.tools}>
          <Link href="/search" className={styles.tool}>
            <SearchIcon />
            <span className={styles.toolLabel}>Search</span>
          </Link>
          <Link href="/inquiry" className={styles.tool}>
            <BagIcon />
            <span className={styles.toolLabel}>Bag</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14l-1.1 13.2a1 1 0 0 1-1 .8H7.1a1 1 0 0 1-1-.8L5 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 7V5.6A3 3 0 0 1 12 2.6a3 3 0 0 1 3 3V7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
