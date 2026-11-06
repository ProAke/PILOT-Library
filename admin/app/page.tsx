"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "pl_ops_token";

export default function LoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [passcodeSet, setPasscodeSet] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/session").catch(() => null);
      const json = res ? await res.json().catch(() => null) : null;
      if (json?.ok) {
        router.replace("/dashboard");
        return;
      }
      setPasscodeSet(Boolean(json?.passcodeSet));
    })();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError("รหัสไม่ถูกต้อง ลองอีกครั้ง");
      setBusy(false);
      return;
    }
    // เก็บ token ไว้ส่งเป็น header ด้วย (เผื่อสภาพแวดล้อมที่บล็อก cookie)
    const probe = await fetch("/api/session").then((r) => r.json()).catch(() => null);
    if (!probe?.ok) {
      const token = await deriveToken(passcode);
      if (token) localStorage.setItem(TOKEN_KEY, token);
    }
    router.replace("/dashboard");
  };

  return (
    <main className="loginWrap">
      <form className="loginCard" onSubmit={submit}>
        <div>
          <h1>PILOT OPS</h1>
          <p>
            คอนโซลฝ่ายปฏิบัติการ · จัดการราคา สต็อก และสถานะสินค้า
            <br />
            ข้อมูลกลางเก็บใน Google Drive (ชีต + โฟลเดอร์รูป)
          </p>
        </div>
        <label>
          Passcode ผู้ดูแล
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="••••"
            required
          />
        </label>
        {error && <p style={{ color: "var(--red)", margin: 0 }}>{error}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "กำลังเข้าระบบ…" : "เข้าระบบ"}
        </button>
        {!passcodeSet && (
          <p className="mono" style={{ fontSize: 10 }}>
            โหมด demo: โฮสต์นี้ยังไม่ได้ตั้ง ADMIN_PASSCODE — ใส่รหัสใดก็ได้เพื่อลอง UI
          </p>
        )}
      </form>
    </main>
  );
}

/** token = HMAC-SHA256(passcode, "pilot-ops-v1") — คำนวณฝั่ง client เป็น fallback */
async function deriveToken(passcode: string): Promise<string | null> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode("pilot-ops-v1"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(passcode));
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}
