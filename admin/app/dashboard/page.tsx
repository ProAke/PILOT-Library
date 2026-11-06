"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  slug: string;
  name: string;
  price: number | null;
  stock: number | null;
  status: "active" | "hidden";
  category: string;
  updatedAt: string;
};

type Status = {
  mode: "sheets" | "demo" | "error";
  sheetUrl: string | null;
  serviceAccount: string | null;
  driveFolderId: string;
  storefront: string;
};

const TOKEN_KEY = "pl_ops_token";

export default function DashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [query, setQuery] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);

  const headers = useCallback((): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    return token ? { "x-ops-token": token } : {};
  }, []);

  const load = useCallback(async () => {
    const [sess, prods, stat] = await Promise.all([
      fetch("/api/session", { headers: headers() }).then((r) => r.json()).catch(() => null),
      fetch("/api/products", { headers: headers() }).then((r) => r.json()).catch(() => null),
      fetch("/api/status", { headers: headers() }).then((r) => r.json()).catch(() => null),
    ]);
    if (!sess?.ok || prods?.rows === undefined) {
      setAuthed(false);
      router.replace("/");
      return;
    }
    setAuthed(true);
    setRows(prods.rows as Row[]);
    setStatus(stat as Status);
  }, [headers, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!rows) return [];
    if (!q) return rows;
    return rows.filter((r) => r.slug.includes(q) || r.name.toLowerCase().includes(q));
  }, [rows, query]);

  const patch = async (slug: string, body: Partial<Row>) => {
    const res = await fetch(`/api/products/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.row) {
      setRows((prev) => prev?.map((r) => (r.slug === slug ? { ...r, ...json.row } : r)) ?? prev);
      return true;
    }
    return false;
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    await fetch("/api/session", { method: "DELETE" });
    router.replace("/");
  };

  if (authed === false) return null;

  return (
    <>
      <header className="topbar">
        <div className="brand">
          PILOT OPS
          <small>OPERATIONS</small>
        </div>
        <span className={`modeBadge ${status?.mode === "sheets" ? "sheets" : "demo"}`}>
          {status?.mode === "sheets" ? "google sheets" : status?.mode === "error" ? "error" : "demo"}
        </span>
        <button className="logout" onClick={logout}>
          ออก
        </button>
      </header>

      <main className="wrap">
        <div className="toolbar">
          <input
            placeholder="ค้นหา SKU / ชื่อสินค้า…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="count">{filtered.length} SKU</span>
        </div>

        {status?.mode === "demo" && (
          <p className="note">
            โหมด demo — ยังไม่ได้ต่อ Google Sheets การแก้ไขจะถูกบันทึกลงไฟล์ชั่วคราวของโฮสต์นี้
            เท่านั้น ตั้ง <span className="mono">PRODUCTS_SHEET_ID</span> + service account
            เพื่อให้บันทึกเข้าชีตจริงใน Drive (ดู docs/ADMIN-SYSTEM.md)
          </p>
        )}
        {status?.mode === "sheets" && (
          <p className="note green">
            เชื่อมต่อชีตจริงแล้ว · SA: <span className="mono">{status.serviceAccount}</span> —
            ทุกการบันทึกเขียนลง Google Sheets ในโฟลเดอร์ Drive ทันที และหน้าร้านจะอ่านค่าใหม่ภายใน ~1 นาที
          </p>
        )}

        <div className="cards">
          {(filtered ?? []).map((row) => (
            <ProductCard key={row.slug} row={row} onSave={patch} />
          ))}
        </div>

        <div className="opsGrid">
          {status?.sheetUrl && (
            <a className="opsRow" href={status.sheetUrl} target="_blank" rel="noreferrer">
              เปิดฐานข้อมูลกลาง (Google Sheets)
              <span className="mono">↗</span>
            </a>
          )}
          <a
            className="opsRow"
            href={`https://drive.google.com/drive/folders/${status?.driveFolderId ?? ""}`}
            target="_blank"
            rel="noreferrer"
          >
            เปิดโฟลเดอร์รูปสินค้า (Google Drive)
            <span className="mono">↗</span>
          </a>
          <a className="opsRow" href={status?.storefront?.replace("/api/products", "/demo") || "/"} target="_blank" rel="noreferrer">
            เปิดหน้าเดโมหน้าร้าน
            <span className="mono">↗</span>
          </a>
        </div>
      </main>
    </>
  );
}

function ProductCard({
  row,
  onSave,
}: {
  row: Row;
  onSave: (slug: string, body: Partial<Row>) => Promise<boolean>;
}) {
  const [price, setPrice] = useState(row.price === null ? "" : String(row.price));
  const [stock, setStock] = useState(row.stock === null ? "" : String(row.stock));
  const [status, setStatus] = useState(row.status);
  const [state, setState] = useState<"idle" | "saving" | "ok" | "err">("idle");

  const dirty =
    (price === "" ? null : Number(price)) !== row.price ||
    (stock === "" ? null : Number(stock)) !== row.stock ||
    status !== row.status;

  const save = async () => {
    setState("saving");
    const ok = await onSave(row.slug, {
      price: price === "" ? null : Number(price),
      stock: stock === "" ? null : Number(stock),
      status,
    });
    setState(ok ? "ok" : "err");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <section className="card">
      <div className="cardHead">
        <h3>{row.name}</h3>
        <span className={`chip ${row.status === "hidden" ? "hidden" : ""}`}>
          {row.status === "hidden" ? "ซ่อนอยู่" : "ขายอยู่"}
        </span>
        <span className="chip">{row.category}</span>
      </div>
      <div className="slug">{row.slug}</div>
      <div className="fieldRow">
        <label>
          ราคา (฿)
          <input
            inputMode="numeric"
            value={price}
            placeholder="ถามราคา"
            onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
          />
        </label>
        <label>
          สต็อก
          <input
            inputMode="numeric"
            value={stock}
            placeholder="ไม่บริหาร"
            onChange={(e) => setStock(e.target.value.replace(/[^\d]/g, ""))}
          />
        </label>
        <label>
          สถานะ
          <select value={status} onChange={(e) => setStatus(e.target.value as Row["status"])}>
            <option value="active">ขายอยู่</option>
            <option value="hidden">ซ่อนชั่วคราว</option>
          </select>
        </label>
      </div>
      <div className="cardFoot">
        <span className={`state ${state === "ok" ? "ok" : state === "err" ? "err" : ""}`}>
          {state === "saving" ? "กำลังบันทึก…" : state === "ok" ? "บันทึกแล้ว ✓" : state === "err" ? "บันทึกไม่สำเร็จ" : row.updatedAt ? `อัปเดต ${row.updatedAt}` : ""}
        </span>
        <button className="primary" disabled={!dirty || state === "saving"} onClick={save}>
          บันทึก
        </button>
      </div>
    </section>
  );
}
