/**
 * Demo store — ใช้ตอนยังไม่ได้ต่อ Google Sheets
 * ---------------------------------------------
 * ดึงแคตตาล็อกจริงจาก API สาธารณะของหน้าร้านมาทำงานต่อ และบันทึกการแก้ไขลง
 * `admin/.data/overrides.json` (พอเพียงสำหรับลอง UI บนเครื่อง/sandbox)
 *
 * ⚠️ บน serverless (Vercel) ไฟล์ระบบอ่านได้อย่างเดียว → โหมดนี้ใช้ทดลองเท่านั้น
 *    งานจริงต้องตั้ง PRODUCTS_SHEET_ID + service account ให้ครบ
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SheetRow } from "./sheet";

const DATA = path.join(process.cwd(), ".data");
const FILE = path.join(DATA, "overrides.json");

const STOREFRONT =
  process.env.STOREFRONT_API_URL?.trim() || "http://127.0.0.1:3000/api/products";

type Overrides = Record<string, Partial<SheetRow>>;

async function loadOverrides(): Promise<Overrides> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Overrides;
  } catch {
    return {};
  }
}

async function saveOverrides(next: Overrides) {
  await mkdir(DATA, { recursive: true });
  await writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
}

let seedCache: { at: number; rows: SheetRow[] } | null = null;

async function seed(): Promise<SheetRow[]> {
  if (seedCache && Date.now() - seedCache.at < 5 * 60_000) return seedCache.rows;
  try {
    const res = await fetch(STOREFRONT, { cache: "no-store" });
    const json = (await res.json()) as {
      products: { slug: string; name: string; price: number | null; category: string }[];
    };
    seedCache = {
      at: Date.now(),
      rows: json.products.map((p) => ({
        slug: p.slug,
        name: p.name,
        price: p.price,
        stock: null,
        status: "active" as const,
        category: p.category,
        updatedAt: "",
      })),
    };
    return seedCache.rows;
  } catch {
    return [
      { slug: "graphic-tee-bone", name: "Graphic Tee Bone", price: 300, stock: null, status: "active", category: "apparel", updatedAt: "" },
      { slug: "canvas-tote-tan", name: "Canvas Tote Tan", price: 300, stock: null, status: "active", category: "objects", updatedAt: "" },
      { slug: "cabin-crew-lanyard", name: "Cabin Crew Lanyard", price: null, stock: null, status: "active", category: "objects", updatedAt: "" },
    ];
  }
}

export async function demoRows(): Promise<SheetRow[]> {
  const base = await seed();
  const overrides = await loadOverrides();
  return base.map((row) => ({ ...row, ...overrides[row.slug] }));
}

export async function demoPatch(slug: string, patch: Partial<SheetRow>): Promise<SheetRow> {
  const rows = await demoRows();
  const current = rows.find((r) => r.slug === slug);
  if (!current) throw new Error(`unknown slug: ${slug}`);
  const merged: SheetRow = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  const overrides = await loadOverrides();
  overrides[slug] = { ...overrides[slug], ...patch, updatedAt: merged.updatedAt };
  await saveOverrides(overrides);
  return merged;
}
