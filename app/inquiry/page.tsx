import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InquiryClient } from "@/components/inquiry-client";

export const metadata: Metadata = {
  title: "รายการที่สนใจ",
  description: "รายการสินค้าที่คุณเลือกไว้ — ส่งรายการให้ PILOT Library ผ่าน LINE หรือโทร",
};

export default function InquiryPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <InquiryClient />
      </main>
      <SiteFooter />
    </>
  );
}
