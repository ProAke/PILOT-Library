import { NextResponse } from "next/server";
import { requestToken } from "@/lib/auth";
import { getServiceAccount, sheetConfigured } from "@/lib/sheet";

export async function GET(request: Request) {
  if (!(await requestToken(request.headers.get("x-ops-token")))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    mode: sheetConfigured() ? "sheets" : "demo",
    sheetId: process.env.PRODUCTS_SHEET_ID?.trim() || null,
    sheetUrl: process.env.PRODUCTS_SHEET_ID
      ? `https://docs.google.com/spreadsheets/d/${process.env.PRODUCTS_SHEET_ID}`
      : null,
    serviceAccount: getServiceAccount()?.client_email ?? null,
    driveFolderId: process.env.DRIVE_FOLDER_ID || "1lda7ww3UybIHobPLm6ZecWaJr4jepiCH",
    storefront: process.env.STOREFRONT_API_URL || "http://127.0.0.1:3000/api/products",
  });
}
