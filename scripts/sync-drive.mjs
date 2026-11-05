#!/usr/bin/env node
/**
 * Lists the connected Google Drive folder so you can verify credentials before
 * wiring them into the app.
 *
 *   GOOGLE_DRIVE_API_KEY=xxx node scripts/sync-drive.mjs
 */
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "1lda7ww3UybIHobPLm6ZecWaJr4jepiCH";
const API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

if (!API_KEY) {
  console.log("No GOOGLE_DRIVE_API_KEY set — the app will serve the bundled snapshot.");
  console.log(`Folder: https://drive.google.com/drive/folders/${FOLDER_ID}`);
  process.exit(0);
}

const params = new URLSearchParams({
  q: `'${FOLDER_ID}' in parents and trashed = false`,
  fields: "files(id,name,mimeType,modifiedTime,size)",
  pageSize: "200",
  key: API_KEY,
  supportsAllDrives: "true",
  includeItemsFromAllDrives: "true",
});

const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
if (!res.ok) {
  console.error(`Drive API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const { files = [] } = await res.json();
console.log(`${files.length} file(s) in ${FOLDER_ID}\n`);
for (const f of files) {
  console.log(` ${f.id}  ${(f.size ?? "—").padStart(8)}  ${f.name}`);
}
