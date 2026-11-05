import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES } from "@/data/products";
import { getDriveConfig, DRIVE_FOLDER_ID } from "@/lib/drive";
import styles from "./journal.module.css";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "เรื่องราวของ PILOT Library — แหล่งที่มาของสินค้า และวิธีเชื่อมต่อแคตตาล็อกกับ Google Drive ผ่าน API",
};

export const revalidate = 600;

export default function JournalPage() {
  const drive = getDriveConfig();

  return (
    <>
      <SiteHeader />
      <main>
        <article className={`${styles.article} wrap`}>
          <header className={styles.head}>
            <p className="eyebrow">Journal · 05 Nov 2026</p>
            <h1 className={styles.title}>Made for the people who fly</h1>
            <p className={styles.lead}>
              PILOT Library เริ่มจากโต๊ะเล็ก ๆ ของลูกเรือที่อยากได้ของใช้ที่ทั้งทนและมีความหมาย
              ทุกชิ้นในแคตตาล็อกจึงถูกเลือกจากงานจริงบนเครื่องบิน ไม่ใช่แค่โลโก้ที่พิมพ์ลงไป
            </p>
          </header>

          <div className={styles.body}>
            <section className={styles.section}>
              <h2>01 · ที่มาของสินค้า</h2>
              <p>
                สินค้าทุกชิ้นถูกถ่ายภาพและเก็บข้อมูลไว้ในโฟลเดอร์ Google Drive
                ชื่อ <strong>Pilot-library</strong> ตั้งแต่ภาพต้นฉบับ ราคา ไปจนถึงไซซ์
                ทำให้ทีมงานอัปเดตได้จากมือถือ โดยไม่ต้องรอ deploy แอปใหม่
              </p>
            </section>

            <section className={styles.section} id="catalog">
              <h2>02 · การเชื่อมต่อข้อมูล (API)</h2>
              <p>
                เว็บและแอปอ่านข้อมูลผ่าน API ภายในของเรา ซึ่งต่อกับ Google Drive
                ด้วย service account หรือ API key โดยมีเส้นทางดังนี้
              </p>

              <div className={styles.code}>
                <p>
                  <span className={styles.get}>GET</span> /api/products
                </p>
                <p>
                  <span className={styles.get}>GET</span> /api/products/&#123;slug&#125;
                </p>
                <p>
                  <span className={styles.get}>GET</span> /api/drive/status
                </p>
              </div>

              <p>
                ตั้งค่าในไฟล์ <code>.env.local</code>:
              </p>
              <pre className={styles.pre}>
{`GOOGLE_DRIVE_FOLDER_ID=${DRIVE_FOLDER_ID}
GOOGLE_DRIVE_API_KEY=your_api_key_here`}
              </pre>
              <p className={styles.small}>
                เมื่อยังไม่ตั้งค่า แอปจะแสดงภาพที่ prerender ไว้ในโฟลเดอร์{" "}
                <code>/public/catalog</code> — แคตตาล็อกจึงเปิดได้ทันทีและใช้งานออฟไลน์ได้
              </p>
            </section>

            <section className={styles.section}>
              <h2>03 · สถานะการเชื่อมต่อ</h2>
              <dl className={styles.status}>
                <div>
                  <dt>Drive folder</dt>
                  <dd>
                    <a href={drive.folderUrl} target="_blank" rel="noreferrer">
                      Pilot-library ↗
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Folder ID</dt>
                  <dd className="mono">{DRIVE_FOLDER_ID}</dd>
                </div>
                <div>
                  <dt>API key</dt>
                  <dd>
                    <span className={drive.configured ? styles.on : styles.off}>
                      {drive.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า (ใช้ snapshot)"}
                    </span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.section} id="mobile">
              <h2>04 · แอปบน iOS &amp; Android</h2>
              <p>
                แคตตาล็อกชุดเดียวกันนี้ถูกแพ็กได้สามแบบ — เปิดบนเบราว์เซอร์มือถือ,
                ติดตั้งเป็น PWA (เพิ่มลงหน้าจอโฮม) หรือบิลด์เป็นแอปเนทีฟด้วย Capacitor
                โดยใช้โค้ดและข้อมูลสินค้าชุดเดียวกันทั้งหมด
              </p>
              <div className={styles.code}>
                <p>
                  <span className={styles.get}>npm</span> run build:mobile
                </p>
                <p>
                  <span className={styles.get}>npm</span> run mobile:sync
                </p>
                <p>
                  <span className={styles.get}>npm</span> run mobile:ios
                </p>
                <p>
                  <span className={styles.get}>npm</span> run mobile:android
                </p>
              </div>
              <p className={styles.small}>
                Native shells: <code>ios/</code> (Xcode) และ <code>android/</code>{" "}
                (Android Studio) · appId <code>com.pilotlibrary.catalogue</code> · ไอคอนและ
                splash สร้างจากโลโก้ด้วย <code>npm run mobile:assets</code>
              </p>
              <p>
                สำหรับเดโมบนมือถือจริง เปิด <a href="/demo">/demo</a> แล้วสแกน QR
              </p>
              <div className={styles.cats}>
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/shop?c=${c.slug}`} className={styles.cat}>
                    <span className="mono">{c.nameTh}</span>
                    <strong>{c.name}</strong>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
