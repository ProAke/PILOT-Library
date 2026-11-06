/**
 * OPS auth — passcode → signed token
 * ----------------------------------
 * Token = HMAC-SHA256(passcode, pepper) ทำให้เซิร์ฟเวอร์ตรวจได้โดยไม่เก็บ
 * รหัสผ่านจริง ส่งกลับเป็น cookie httpOnly และ fallback เป็น header
 * `x-ops-token` (สำหรับ environment ที่บล็อก cookie เช่น preview iframe)
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "pl_ops";
const PEPPER = "pilot-ops-v1";

export function expectedPasscode(): string {
  return process.env.ADMIN_PASSCODE?.trim() || "";
}

export function signToken(passcode: string): string {
  return createHmac("sha256", PEPPER).update(passcode).digest("hex");
}

export function validToken(token: string | null): boolean {
  if (!token) return false;
  const pass = expectedPasscode();
  // โหมด demo (ยังไม่ตั้งรหัส): รับ token รูปแบบถูกต้องใด ๆ — เอกสารกำกับว่า
  // ต้องตั้ง ADMIN_PASSCODE ก่อนขึ้นงานจริง
  if (!pass) return /^[0-9a-f]{64}$/.test(token);
  const a = Buffer.from(token);
  const b = Buffer.from(signToken(pass));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requestToken(headerValue: string | null): Promise<boolean> {
  if (validToken(headerValue)) return true;
  const store = await cookies();
  return validToken(store.get(COOKIE)?.value ?? null);
}

export const OPS_COOKIE = COOKIE;
