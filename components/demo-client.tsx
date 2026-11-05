"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./demo-client.module.css";

type DemoTarget = { url: string; native: readonly { platform: string; requirement: string; steps: readonly string[] }[] };

export function DemoClient({ demo }: { demo: DemoTarget }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(demo.url);

  // The QR must always encode the URL the visitor is actually looking at —
  // sandbox previews rotate between sessions, so the baked-in value is only a
  // fallback for non-browser contexts.
  useEffect(() => {
    const host = window.location.hostname;
    const real = host.includes(".") && host !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(host);
    if (real) setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const QR = (await import("qrcode")).default;
        if (cancelled || !canvasRef.current) return;
        await QR.toCanvas(canvasRef.current, origin, {
          width: 512,
          margin: 1,
          color: { dark: "#121820", light: "#f7f5f1" },
          errorCorrectionLevel: "M",
        });
      } catch {
        /* canvas fallback below */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [origin]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isSecure = origin.startsWith("https://");
  const url = new URL(origin);

  return (
    <div className={`${styles.page} wrap`}>
      <header className={styles.head}>
        <p className="eyebrow">Demo · มือถือจริง</p>
        <h1 className={styles.title}>ลองแอปบนมือถือ</h1>
        <p className={styles.lead}>
          สแกน QR ด้านล่างด้วยกล้องโทรศัพท์เพื่อเปิดแคตตาล็อกบนมือถือจริง
          หรือกด “เพิ่มลงหน้าจอโฮม” เพื่อใช้งานเป็นแอปเต็มจอ — ทดสอบได้ทั้ง iOS และ Android
        </p>
      </header>

      <div className={styles.grid}>
        <section className={styles.qrCard} aria-labelledby="qr-title">
          <h2 id="qr-title" className={styles.cardTitle}>
            สแกนเพื่อเปิด
          </h2>
          <div className={styles.qrWrap}>
            <div className={styles.qrBox}>
              <canvas ref={canvasRef} className={styles.qr} aria-label={`QR code for ${origin}`} />
            </div>
          </div>
          <p className={styles.url} title={origin}>
            {url.host}
          </p>
          <a href={origin} target="_blank" rel="noreferrer" className={styles.openBtn}>
            เปิดในแท็บใหม่ ↗
          </a>
          <button type="button" onClick={copy} className={styles.copyBtn}>
            {copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}
          </button>
          {!isSecure && (
            <p className={styles.warn}>
              ลิงก์นี้ไม่ได้ใช้ HTTPS — กล้องบางรุ่นจะไม่ยอมเปิด และการติดตั้งเป็นแอป (PWA)
              ต้องใช้ https เท่านั้น
            </p>
          )}
        </section>

        <section className={styles.steps} aria-labelledby="install-title">
          <h2 id="install-title" className={styles.cardTitle}>
            ติดตั้งเป็นแอป (PWA)
          </h2>

          <div className={styles.platform}>
            <span className={styles.badge}>iOS · Safari</span>
            <ol>
              <li>เปิดลิงก์ด้านซ้ายด้วย Safari บน iPhone</li>
              <li>
                กดปุ่ม <strong>แชร์</strong> (ไอคอนสี่เหลี่ยมมีลูกศร)
              </li>
              <li>
                เลือก <strong>เพิ่มไปยังหน้าจอโฮม</strong>
              </li>
              <li>เปิดไอคอน PILOT Library — จะเห็นแถบเมนูล่างแบบแอปจริง</li>
            </ol>
          </div>

          <div className={styles.platform}>
            <span className={styles.badge}>Android · Chrome</span>
            <ol>
              <li>เปิดลิงก์ด้วย Chrome</li>
              <li>
                กดเมนู ⋮ มุมขวาบน → <strong>ติดตั้งแอป</strong> / เพิ่มไปที่หน้าจอหลัก
              </li>
              <li>เปิดจากไอคอน — ทำงานเต็มจอ ไม่มีแถบที่อยู่</li>
            </ol>
          </div>

          <div className={styles.platform}>
            <span className={styles.badge}>ทดสอบแบบไม่ติดตั้ง</span>
            <p className={styles.hint}>
              เปิดในเบราว์เซอร์มือถือแล้วหมุน/ย่อ–ขยายได้ทันที หรือใช้ DevTools → Toggle device toolbar
              เพื่อจำลอง iPhone 15 / Pixel 8
            </p>
          </div>
        </section>
      </div>

      <section className={styles.native} aria-labelledby="native-title">
        <h2 id="native-title" className={styles.cardTitle}>
          บิลด์เป็นแอปเนทีฟ (iOS / Android)
        </h2>
        <p className={styles.nativeLead}>
          โปรเจกต์มี shell ของ Capacitor พร้อมแล้วใน <code>ios/</code> และ <code>android/</code>{" "}
          — ใช้แคตตาล็อกชุดเดียวกับเว็บ แต่แพ็กเป็นไฟล์แอปที่ติดตั้งได้จริง
        </p>
        <div className={styles.nativeGrid}>
          {demo.native.map((n) => (
            <div key={n.platform} className={styles.nativeCard}>
              <h3>{n.platform}</h3>
              <p className={styles.req}>{n.requirement}</p>
              <pre>
                {n.steps.map((s) => (
                  <span key={s}>{s}
                  </span>
                ))}
              </pre>
            </div>
          ))}
        </div>
        <p className={styles.nativeFoot}>
          รายละเอียดทั้งหมดอยู่ที่ <Link href="/journal#mobile">Journal → Mobile build</Link>
        </p>
      </section>
    </div>
  );
}
