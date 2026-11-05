"use client";

import { useState } from "react";
import type { ProductImage } from "@/data/products";
import styles from "./product-gallery.module.css";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[active] ?? images[0];

  if (!current) return null;

  return (
    <div className={styles.gallery}>
      <div className={`${styles.main} ${zoom ? styles.zoomed : ""}`}>
        <button
          type="button"
          className={styles.zoomBtn}
          onClick={() => setZoom((v) => !v)}
          aria-label={zoom ? "ย่อรูป" : "ขยายรูป"}
        >
          {zoom ? "−" : "+"}
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.src}
          src={current.src}
          alt={current.alt || name}
          className={styles.img}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label="รูปสินค้า">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ""}`}
              onClick={() => {
                setActive(i);
                setZoom(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
