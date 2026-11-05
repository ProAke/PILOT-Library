"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import styles from "./shop-toolbar.module.css";

type Props = {
  sorts: { key: string; label: string }[];
  active: string;
  total: number;
};

export function ShopToolbar({ sorts, active, total }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const change = (key: string) => {
    const next = new URLSearchParams(params.toString());
    if (key === "featured") next.delete("sort");
    else next.set("sort", key);
    start(() => router.replace(`/shop?${next.toString()}`, { scroll: false }));
  };

  return (
    <div className={`${styles.bar} wrap`}>
      <p className={styles.count}>
        <span className="mono">{String(total).padStart(2, "0")}</span> items
      </p>
      <div className={styles.sorts} role="group" aria-label="เรียงลำดับสินค้า">
        {sorts.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => change(s.key)}
            className={`${styles.sort} ${active === s.key ? styles.sortActive : ""}`}
            aria-pressed={active === s.key}
            disabled={pending}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
