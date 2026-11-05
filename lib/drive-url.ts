/** Drive URL helpers that are safe to import from client components. */
export const DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID ?? "1lda7ww3UybIHobPLm6ZecWaJr4jepiCH";

/** Public thumbnail endpoint — no API key needed, works in <img>. */
export function driveImageUrl(fileId: string, width = 900): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

export function driveViewUrl(fileId: string): string {
  if (!fileId) return `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function driveFolderUrl(): string {
  return `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
}
