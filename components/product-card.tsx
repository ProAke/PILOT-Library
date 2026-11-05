"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart-provider";
import styles from "./product-card.module.css";

const TAG_LABEL: Record<string, string> = {
  new: "New",
  bestseller: "Bestseller",
  limited: "Limited",
  eco: "Eco",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [hover, setHover] = useState(false);
  const { add } = useCart();
  const image = product.images[0];
  const secondary = product.images[1];

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/product/${product.slug}`} className={styles.media} aria-label={product.name}>
        <div className={styles.tile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image?.src}
            alt={image?.alt ?? product.name}
            className={`${styles.img} ${hover && secondary ? styles.imgHidden : ""}`}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            width={900}
            height={900}
          />
          {secondary && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={secondary.src}
              alt=""
              aria-hidden="true"
              className={`${styles.img} ${styles.imgSecond} ${hover ? styles.imgShown : ""}`}
              loading="lazy"
              decoding="async"
              width={900}
              height={900}
            />
          )}
        </div>
        {product.tags.length > 0 && (
          <span className={styles.tag}>{TAG_LABEL[product.tags[0]] ?? product.tags[0]}</span>
        )}
        <button
          type="button"
          className={styles.quick}
          onClick={(e) => {
            e.preventDefault();
            add({
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: image?.src ?? "",
              size: product.sizes?.[0],
              color: product.colors?.[0]?.name,
            });
          }}
          aria-label={`เพิ่ม ${product.name} ลงรายการที่สนใจ`}
        >
          + เพิ่มในรายการ
        </button>
      </Link>

      <div className={styles.meta}>
        <Link href={`/product/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>
        <p className={styles.price}>{formatPrice(product.price)}</p>
        {product.colors && product.colors.length > 1 && (
          <ul className={styles.swatches} aria-label="สีที่มี">
            {product.colors.slice(0, 6).map((c) => (
              <li key={c.name} title={c.name} style={{ background: c.hex }} />
            ))}
            {product.colors.length > 6 && <li className={styles.more}>+{product.colors.length - 6}</li>}
          </ul>
        )}
      </div>
    </article>
  );
}
