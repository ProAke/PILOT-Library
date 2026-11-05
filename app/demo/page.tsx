import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoClient } from "@/components/demo-client";
import { DEMO } from "@/lib/demo-config";

export const metadata: Metadata = {
  title: "Demo บนมือถือ",
  description:
    "เปิดแอป PILOT Library บนมือถือจริง — สแกน QR เพื่อทดลอง หรือติดตั้งเป็นแอปบน iOS / Android",
};

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <DemoClient demo={DEMO} />
      </main>
      <SiteFooter />
    </>
  );
}
