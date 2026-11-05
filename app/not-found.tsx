import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className={`${styles.page} wrap`}>
        <p className="eyebrow">404 · Gate changed</p>
        <h1 className={styles.title}>ไม่พบหน้าที่คุณต้องการ</h1>
        <p className={styles.body}>
          หน้านี้อาจถูกย้ายหรือสินค้าหมดรอบแล้ว ลองกลับไปเลือกดูจากแคตตาล็อกอีกครั้ง
        </p>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.primary}>
            ไปที่แคตตาล็อก
          </Link>
          <Link href="/" className={styles.secondary}>
            กลับหน้าแรก
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
