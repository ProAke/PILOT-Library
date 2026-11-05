"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { CATEGORIES } from "@/data/products";
import styles from "./search-client.module.css";

type Entry = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  price: number | null;
  summary: string;
  image: string;
  colors: string[];
  tags: string[];
};

const SUGGESTIONS = ["lanyard", "กระเป๋า", "umbrella", "tee", "keychain", "A350"];

const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

export function SearchClient({ index }: { index: Entry[] }) {
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const term = deferred.trim().toLowerCase();
    if (!term) return [];
    const words = term.split(/\s+/);
    return index
      .map((entry) => {
        const haystack = [
          entry.name,
          entry.sku,
          entry.summary,
          catName(entry.category),
          ...entry.colors,
          ...entry.tags,
        ]
          .join(" ")
          .toLowerCase();
        const score = words.reduce((acc, w) => (haystack.includes(w) ? acc + 1 : acc), 0);
        return { entry, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.entry);
  }, [deferred, index]);

  return (
    <div className={`${styles.page} wrap`}>
      <p className="eyebrow">Search</p>
      <h1 className={styles.title}>ค้นหาสินค้า</h1>

      <div className={styles.field}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ลองพิมพ์ “lanyard” หรือ “กระเป๋า”"
          aria-label="ค้นหาสินค้า"
          enterKeyHint="search"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="ล้างคำค้นหา" className={styles.clear}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.suggestions}>
        <span className="mono">แนะนำ</span>
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setQ(s)} className={styles.chip}>
            {s}
          </button>
        ))}
      </div>

      <div className={styles.results} aria-live="polite">
        {deferred.trim() && (
          <p className={styles.count}>
            <span className="mono">{String(results.length).padStart(2, "0")}</span> ผลลัพธ์
            {deferred.trim() ? ` สำหรับ “${deferred.trim()}”` : ""}
          </p>
        )}

        {results.map((item) => (
          <Link key={item.slug} href={`/product/${item.slug}`} className={styles.row}>
            <span className={styles.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" aria-hidden="true" />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowName}>{item.name}</span>
              <span className={styles.rowMeta}>
                {catName(item.category)} · {item.sku}
              </span>
              <span className={styles.rowSummary}>{item.summary}</span>
            </span>
            <span className={`${styles.rowPrice} mono`}>{formatPrice(item.price)}</span>
          </Link>
        ))}

        {deferred.trim() && results.length === 0 && (
          <div className={styles.noResults}>
            <p>ไม่พบสินค้าที่ตรงกับคำค้น</p>
            <Link href="/shop">ดูสินค้าทั้งหมด →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
