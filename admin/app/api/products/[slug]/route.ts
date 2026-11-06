import { NextResponse } from "next/server";
import { requestToken } from "@/lib/auth";
import { sheetConfigured, writeRow } from "@/lib/sheet";
import { demoPatch } from "@/lib/demo-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await requestToken(request.headers.get("x-ops-token")))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    price?: number | null;
    stock?: number | null;
    status?: "active" | "hidden";
  };
  const patch: { price?: number | null; stock?: number | null; status?: "active" | "hidden" } = {};
  if ("price" in body) patch.price = body.price === null || body.price === undefined ? null : Number(body.price);
  if ("stock" in body) patch.stock = body.stock === null || body.stock === undefined ? null : Number(body.stock);
  if (body.status === "active" || body.status === "hidden") patch.status = body.status;

  try {
    const row = sheetConfigured() ? await writeRow(slug, patch) : await demoPatch(slug, patch);
    return NextResponse.json({ ok: true, mode: sheetConfigured() ? "sheets" : "demo", row });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
