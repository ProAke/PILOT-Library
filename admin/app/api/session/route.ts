import { NextResponse } from "next/server";
import { OPS_COOKIE, expectedPasscode, signToken, validToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { passcode?: string };
  const expected = expectedPasscode();
  const supplied = (body.passcode ?? "").trim();
  // โหมด demo (ยังไม่ตั้งรหัส): รับรหัสใดก็ได้เพื่อให้ลอง UI ได้
  const ok = expected ? supplied === expected : supplied.length > 0;
  if (!ok) return NextResponse.json({ error: "wrong_passcode" }, { status: 401 });

  const token = signToken(expected || supplied);
  const res = NextResponse.json({ ok: true, demo: !expected });
  res.cookies.set(OPS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function GET(request: Request) {
  const token = request.headers.get("x-ops-token");
  const cookie = request.headers.get("cookie") ?? "";
  const fromCookie = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OPS_COOKIE}=`))
    ?.split("=")[1];
  const ok = validToken(token) || validToken(fromCookie ?? null);
  return NextResponse.json({ ok, passcodeSet: Boolean(expectedPasscode()) });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OPS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
