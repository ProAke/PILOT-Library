/**
 * Google Sheets = ฐานข้อมูลฝ่ายปฏิบัติการ (operations database)
 * ---------------------------------------------------------------
 * ชีตหนึ่งใบในโฟลเดอร์ Drive เดิมทำหน้าที่เป็น "หลังบ้าน" ของแคตตาล็อก:
 * แถวแรกเป็นหัวคอลัมน์ จากนั้นหนึ่งแถวต่อหนึ่ง SKU
 *
 *   slug | name | price | stock | status | category | updated_at
 *
 * - `price` ว่าง = สอบถามราคา · `status` = active | hidden
 * - เจ้าของร้านแก้ในชีตตรง ๆ ก็ได้ หรือแก้ผ่านหน้า admin (`admin/`) ก็ได้
 * - ทั้ง storefront (อ่าน) และ admin (อ่าน/เขียน) ใช้โมดูลนี้ร่วมกัน
 *
 * ต้องตั้ง env (ดู .env.example): GOOGLE_SERVICE_ACCOUNT_JSON (หรือ
 * GOOGLE_SA_CLIENT_EMAIL + GOOGLE_SA_PRIVATE_KEY) และ PRODUCTS_SHEET_ID
 * แล้วแชร์ชีตให้ service account เป็น Writer — ถ้าไม่ตั้ง ระบบจะใช้ข้อมูล
 * ที่ฝังมากับแอปแทน (mode: bundled)
 */
import { createSign } from "node:crypto";

export const SHEET_HEADER = [
  "slug",
  "name",
  "price",
  "stock",
  "status",
  "category",
  "updated_at",
] as const;

export type SheetRow = {
  slug: string;
  name: string;
  price: number | null;
  stock: number | null;
  status: "active" | "hidden";
  category: string;
  updatedAt: string;
};

type ServiceAccount = { client_email: string; private_key: string };

export function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      const json = JSON.parse(raw);
      if (json.client_email && json.private_key) {
        return { client_email: json.client_email, private_key: String(json.private_key).replace(/\\n/g, "\n") };
      }
    } catch {
      /* fall through to split vars */
    }
  }
  const email = process.env.GOOGLE_SA_CLIENT_EMAIL?.trim();
  const key = process.env.GOOGLE_SA_PRIVATE_KEY?.trim()?.replace(/\\n/g, "\n");
  if (email && key) return { client_email: email, private_key: key };
  return null;
}

export function sheetConfigured(): boolean {
  return Boolean(getServiceAccount() && process.env.PRODUCTS_SHEET_ID?.trim());
}

export function sheetId(): string | null {
  return process.env.PRODUCTS_SHEET_ID?.trim() || null;
}

/* ------------------------------------------------------------------ auth */

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.readonly",
].join(" ");

let tokenCache: { token: string; expiresAt: number } | null = null;

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

export async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const sa = getServiceAccount();
  if (!sa) throw new Error("service account not configured");

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3500,
      iat: now,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${b64url(signer.sign(sa.private_key))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3A%ietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${assertion}`,
  });
  if (!res.ok) throw new Error(`google token failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return tokenCache.token;
}

/* ----------------------------------------------------------------- read */

let rowCache: { at: number; rows: Map<string, SheetRow> } | null = null;
const CACHE_MS = 60_000;

function toRow(cells: string[]): SheetRow | null {
  const slug = (cells[0] ?? "").trim();
  if (!slug) return null;
  const priceRaw = (cells[2] ?? "").trim();
  const stockRaw = (cells[3] ?? "").trim();
  const status = (cells[4] ?? "active").trim().toLowerCase();
  return {
    slug,
    name: (cells[1] ?? "").trim(),
    price: priceRaw === "" ? null : Number(priceRaw),
    stock: stockRaw === "" ? null : Number(stockRaw),
    status: status === "hidden" ? "hidden" : "active",
    category: (cells[5] ?? "").trim(),
    updatedAt: (cells[6] ?? "").trim(),
  };
}

export async function readSheetRows(force = false): Promise<Map<string, SheetRow>> {
  if (!sheetConfigured()) return new Map();
  if (!force && rowCache && Date.now() - rowCache.at < CACHE_MS) return rowCache.rows;

  const id = sheetId()!;
  const token = await accessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A:G?valueRenderOption=UNFORMATTED_VALUE`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`sheets read failed: ${res.status}`);
  const json = (await res.json()) as { values?: string[][] };

  const rows = new Map<string, SheetRow>();
  for (const cells of (json.values ?? []).slice(1)) {
    const row = toRow(cells);
    if (row) rows.set(row.slug, row);
  }
  rowCache = { at: Date.now(), rows };
  return rows;
}

/* ---------------------------------------------------------------- write */

export async function updateSheetRow(
  slug: string,
  patch: Partial<Pick<SheetRow, "price" | "stock" | "status" | "name">>,
): Promise<SheetRow> {
  if (!sheetConfigured()) throw new Error("sheets not configured");
  const id = sheetId()!;
  const rows = await readSheetRows(true);
  const existing = rows.get(slug);
  if (!existing) throw new Error(`unknown slug: ${slug}`);

  const merged: SheetRow = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  // locate the physical row (header = row 1)
  const token = await accessToken();
  const listUrl = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A:A?valueRenderOption=UNFORMATTED_VALUE`;
  const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const listJson = (await listRes.json()) as { values?: string[][] };
  const idx = (listJson.values ?? []).findIndex((c) => (c[0] ?? "").trim() === slug);
  if (idx < 0) throw new Error(`slug not in sheet: ${slug}`);
  const rowNum = idx + 1;

  const values = [
    merged.slug,
    merged.name,
    merged.price === null ? "" : String(merged.price),
    merged.stock === null ? "" : String(merged.stock),
    merged.status,
    merged.category,
    merged.updatedAt,
  ];

  const putUrl = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A${rowNum}:G${rowNum}?valueInputOption=RAW`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [values] }),
  });
  if (!putRes.ok) throw new Error(`sheets write failed: ${putRes.status}`);

  rowCache = null;
  return merged;
}
