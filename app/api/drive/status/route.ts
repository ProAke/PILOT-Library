import { NextResponse } from "next/server";
import { getDriveConfig, listDriveFolder } from "@/lib/drive";

export const revalidate = 60;

/**
 * GET /api/drive/status
 * Health check for the Google Drive bridge — shows whether the API key is
 * configured, how many files were listed and which env vars are missing.
 */
export async function GET() {
  const config = getDriveConfig();
  const { files, error } = await listDriveFolder();

  const missingEnv: string[] = [];
  if (!process.env.GOOGLE_DRIVE_API_KEY) missingEnv.push("GOOGLE_DRIVE_API_KEY");
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    missingEnv.push("GOOGLE_DRIVE_FOLDER_ID (falling back to the bundled folder id)");
  }

  return NextResponse.json(
    {
      ok: config.configured && !error,
      configured: config.configured,
      folderId: config.folderId,
      folderUrl: config.folderUrl,
      fileCount: files.length,
      files: files.slice(0, 50).map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        modifiedTime: f.modifiedTime,
      })),
      error,
      missingEnv,
      hint: config.configured
        ? "Drive folder is being read live."
        : "Add GOOGLE_DRIVE_API_KEY to .env.local to stream photos from Drive. The bundled snapshot is served meanwhile.",
    },
    {
      headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
    },
  );
}
