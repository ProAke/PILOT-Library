import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShopBrowser } from "@/components/shop-browser";

export const metadata: Metadata = {
  title: "Shop all",
  description: "สินค้าทั้งหมดของ PILOT Library — เสื้อผ้า กระเป๋า อุปกรณ์การบิน และของที่ระลึก",
};

export default function ShopPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Suspense fallback={null}>
          <ShopBrowser />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
