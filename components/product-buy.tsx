"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart-provider";
import styles from "./product-buy.module.css";

export function ProductBuy({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes?.[0]);
  const [color, setColor] = useState(product.colors?.[0]?.name);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const total = useMemo(
    () => (product.price === null ? null : product.price * qty),
    [product.price, qty],
  );

  const submit = () => {
    add(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0]?.src ?? "",
        size,
        color,
      },
      qty,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className={styles.buy}>
      <p className={styles.price}>
        {formatPrice(product.price)}
        {product.price !== null && <span className={styles.unit}> / ชิ้น</span>}
      </p>

      {product.colors && product.colors.length > 0 && (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            สี <span className={styles.chosen}>{color}</span>
          </legend>
          <div className={styles.colors}>
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                className={`${styles.color} ${color === c.name ? styles.colorActive : ""}`}
                aria-pressed={color === c.name}
                aria-label={c.name}
                title={c.name}
              >
                <span style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            ไซซ์ <span className={styles.chosen}>{size}</span>
          </legend>
          <div className={styles.sizes}>
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`${styles.size} ${size === s ? styles.sizeActive : ""}`}
                aria-pressed={size === s}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.qtyRow}>
        <div className={styles.stepper}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="ลดจำนวน">
            −
          </button>
          <span className="mono" aria-live="polite">
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="เพิ่มจำนวน">
            +
          </button>
        </div>
        <p className={styles.subtotal}>
          {total === null ? "ราคาแจ้งโดยร้าน" : <>รวม <span className="mono">{formatPrice(total)}</span></>}
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={submit} className={styles.primary}>
          {added ? "เพิ่มแล้ว ✓" : "เพิ่มในรายการที่สนใจ"}
        </button>
        <Link href="/inquiry" className={styles.secondary}>
          ดูรายการ ({qty})
        </Link>
      </div>

      <ul className={styles.assurance}>
        <li>ส่งฟรีเมื่อซื้อครบ ฿1,500</li>
        <li>เปลี่ยน/คืนได้ภายใน 7 วัน</li>
        <li>สอบถามสต็อกได้ทาง LINE @pilotlibrary</li>
      </ul>
    </div>
  );
}
