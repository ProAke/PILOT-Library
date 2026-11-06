import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/noto-sans-thai";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "PILOT OPS · ระบบจัดการ",
  description:
    "คอนโซลฝ่ายปฏิบัติการของ PILOT Library — จัดการราคา/สต็อก/สถานะสินค้า จากมือถือ โดยข้อมูลกลางอยู่ใน Google Drive",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10151c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
