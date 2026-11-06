/**
 * Google Sheets client (ops side)
 * -------------------------------
 * ตัวเดียวกับ `lib/sheet.ts` ของ storefront แต่คัดลอกมาให้แอป admin พึ่งพา
 * ตนเองได้เต็มที่ (แยก deploy คนละโปรเจกต์บนโฮสติ้ง)
 */
import { createSign } from "node:crypto";

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
      /* split vars below */
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

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.readonly",
].join(" ");

let tokenCache: { token: string; expiresAt: number } | null = null;
const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const sa = getServiceAccount()!;
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

function toRow(cells: string[]): SheetRow | null {
  const slug = (cells[0] ?? "").trim();
  if (!slug) return null;
  const price = (cells[2] ?? "").trim();
  const stock = (cells[3] ?? "").trim();
  return {
    slug,
    name: (cells[1] ?? "").trim(),
    price: price === "" ? null : Number(price),
    stock: stock === "" ? null : Number(stock),
    status: (cells[4] ?? "active").trim() === "hidden" ? "hidden" : "active",
    category: (cells[5] ?? "").trim(),
    updatedAt: (cells[6] ?? "").trim(),
  };
}

export async function readRows(): Promise<SheetRow[]> {
  const id = process.env.PRODUCTS_SHEET_ID!;
  const token = await accessToken();
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A:G?valueRenderOption=UNFORMATTED_VALUE`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`sheets read failed: ${res.status}`);
  const json = (await res.json()) as { values?: string[][] };
  return (json.values ?? []).slice(1).map(toRow).filter((r): r is SheetRow => r !== null);
}

export async function writeRow(slug: string, patch: Partial<SheetRow>): Promise<SheetRow> {
  const id = process.env.PRODUCTS_SHEET_ID!;
  const rows = await readRows();
  const idx = rows.findIndex((r) => r.slug === slug);
  if (idx < 0) throw new Error(`unknown slug: ${slug}`);
  const merged: SheetRow = {
    ...rows[idx],
    ...patch,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  const rowNum = idx + 2; // header = row 1
  const token = await accessToken();
  const values = [
    merged.slug,
    merged.name,
    merged.price === null ? "" : String(merged.price),
    merged.stock === null ? "" : String(merged.stock),
    merged.status,
    merged.category,
    merged.updatedAt,
  ];
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/A${rowNum}:G${rowNum}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!res.ok) throw new Error(`sheets write failed: ${res.status}`);
  return merged;
}
