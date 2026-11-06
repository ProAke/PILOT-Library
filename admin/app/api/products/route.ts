import { NextResponse } from "next/server";
import { requestToken } from "@/lib/auth";
import { readRows, sheetConfigured } from "@/lib/sheet";
import { demoRows } from "@/lib/demo-store";

export async function GET(request: Request) {
  if (!(await requestToken(request.headers.get("x-ops-token")))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const rows = sheetConfigured() ? await readRows() : await demoRows();
    return NextResponse.json({ mode: sheetConfigured() ? "sheets" : "demo", rows });
  } catch (err) {
    return NextResponse.json(
      { mode: "error", error: err instanceof Error ? err.message : String(err), rows: [] },
      { status: 502 },
    );
  }
}
