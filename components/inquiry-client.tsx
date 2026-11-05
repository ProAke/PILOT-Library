"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart, cartItemKey } from "@/components/cart-provider";
import { formatPrice, lineInquiry } from "@/lib/format";
import styles from "./inquiry-client.module.css";

const PHONE = "0816455575";
const LINE_ID = "@pilotlibrary";

export function InquiryClient() {
  const { items, ready, setQty, remove, clear } = useCart();
  const [copied, setCopied] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0),
    [items],
  );
  const hasQuoteOnly = items.some((i) => i.price === null);

  const text = useMemo(() => {
    const lines = items.map((i) => `• ${lineInquiry(i)}`);
    return [
      "สนใจสั่งซื้อจาก PILOT Library",
      "",
      ...lines,
      "",
      `ยอดรวมโดยประมาณ ฿${subtotal.toLocaleString("en-US")}`,
      hasQuoteOnly ? "(บางรายการสอบถามราคา)" : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [items, subtotal, hasQuoteOnly]);

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className={`${styles.page} wrap`}>
      <header className={styles.head}>
        <p className="eyebrow">Inquiry bag</p>
        <h1 className={styles.title}>รายการที่สนใจ</h1>
        <p className={styles.blurb}>
          เก็บสินค้าที่ต้องการไว้ แล้วส่งรายการให้เราเพื่อเช็คสต็อกและยืนยันราคา
          ผ่าน LINE หรือโทรได้ทันที — ไม่ต้องชำระเงินบนเว็บ
        </p>
      </header>

      {!ready ? (
        <p className={styles.loading}>กำลังโหลดรายการ…</p>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>ยังไม่มีสินค้าในรายการ</p>
          <p className={styles.emptyBody}>
            เลือกสินค้าที่คุณชอบจากแคตตาล็อก แล้วกด “เพิ่มในรายการที่สนใจ”
          </p>
          <Link href="/shop" className={styles.emptyCta}>
            ไปที่แคตตาล็อก →
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <ul className={styles.list}>
            {items.map((item) => {
              const key = cartItemKey(item);
              return (
                <li key={key} className={styles.item}>
                  <Link href={`/product/${item.slug}`} className={styles.thumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" aria-hidden="true" />
                  </Link>
                  <div className={styles.itemBody}>
                    <Link href={`/product/${item.slug}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    <p className={styles.itemMeta}>
                      {[item.color, item.size && `ไซซ์ ${item.size}`].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.stepper}>
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty - 1)}
                        aria-label="ลดจำนวน"
                      >
                        −
                      </button>
                      <span className="mono">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty + 1)}
                        aria-label="เพิ่มจำนวน"
                      >
                        +
                      </button>
                    </div>
                    <button type="button" onClick={() => remove(key)} className={styles.remove}>
                      ลบ
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>สรุปรายการ</h2>
            <div className={styles.row}>
              <span>จำนวนชิ้น</span>
              <span className="mono">{items.reduce((n, i) => n + i.qty, 0)}</span>
            </div>
            <div className={styles.row}>
              <span>ยอดรวมโดยประมาณ</span>
              <span className="mono">{formatPrice(subtotal)}</span>
            </div>
            {hasQuoteOnly && (
              <p className={styles.note}>* บางรายการต้องสอบถามราคากับทางร้านก่อน</p>
            )}

            <div className={styles.actions}>
              <a
                href={`https://line.me/R/oaMessage/${encodeURIComponent(LINE_ID)}/?${encodeURIComponent(text)}`}
                target="_blank"
                rel="noreferrer"
                className={styles.lineBtn}
              >
                ส่งรายการทาง LINE
              </a>
              <a href={`tel:+66${PHONE.slice(1)}`} className={styles.callBtn}>
                โทร {PHONE.replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3")}
              </a>
              <button type="button" onClick={copyList} className={styles.copyBtn}>
                {copied ? "คัดลอกรายการแล้ว ✓" : "คัดลอกรายการ"}
              </button>
            </div>

            <button type="button" onClick={clear} className={styles.clear}>
              ล้างรายการทั้งหมด
            </button>

            <p className={styles.summaryFoot}>
              ราคาสินค้าอาจเปลี่ยนแปลงตามรอบผลิต · ยืนยันราคาอีกครั้งก่อนชำระเงิน
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
