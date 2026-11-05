/**
 * Google Drive bridge
 * -------------------
 * The catalogue is authored once inside the Google Drive folder `Pilot-library`
 * (folder id `1lda7ww3UybIHobPLm6ZecWaJr4jepiCH`).
 *
 * Two layers:
 *   1. Curated metadata (names, prices, sizes, copy) shipped with the app in
 *      `data/products.ts` so the storefront is instant and works offline.
 *   2. Live photo/asset resolution from Drive. When `GOOGLE_DRIVE_API_KEY` is
 *      configured the server lists the folder through the Drive v3 REST API
 *      and swaps every `driveId` for a freshly signed CDN URL. When it is not
 *      configured, the pre-built local tiles in `/public/catalog` are served
 *      and the API reports `source: "local"`.
 *
 * Optional: a `catalog.json` file placed inside the Drive folder can override
 * price / name / summary per SKU without redeploying the app.
 */

import { PRODUCTS, CATEGORIES, type Product, type CategorySlug } from "@/data/products";
import { DRIVE_FOLDER_ID, driveImageUrl, driveViewUrl } from "./drive-url";

export { DRIVE_FOLDER_ID, driveImageUrl, driveViewUrl };

export type DriveConfig = {
  folderId: string;
  apiKey: string | null;
  folderUrl: string;
  configured: boolean;
};

export function getDriveConfig(): DriveConfig {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim() || null;
  return {
    folderId: DRIVE_FOLDER_ID,
    apiKey,
    folderUrl: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`,
    configured: Boolean(apiKey),
  };
}

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  imageMediaMetadata?: { width: number; height: number };
  modifiedTime?: string;
};

/**
 * Lists the connected folder. Cached for 10 minutes so the Drive quota is
 * respected while the catalogue still feels live.
 */
export async function listDriveFolder(): Promise<{
  files: DriveFile[];
  configured: boolean;
  error: string | null;
}> {
  const { apiKey, folderId, configured } = getDriveConfig();
  if (!configured) {
    return { files: [], configured: false, error: null };
  }

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,modifiedTime,imageMediaMetadata(width,height))",
    pageSize: "200",
    key: apiKey as string,
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      next: { revalidate: 600 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return {
        files: [],
        configured: true,
        error: `Drive API responded ${res.status} ${res.statusText}`,
      };
    }
    const json = (await res.json()) as { files?: DriveFile[] };
    return { files: json.files ?? [], configured: true, error: null };
  } catch (err) {
    return {
      files: [],
      configured: true,
      error: err instanceof Error ? err.message : "Unknown Drive error",
    };
  }
}

export type CatalogSource = "local" | "drive";

export type LiveProduct = Product & {
  /** true when at least one photo resolved from Drive */
  liveImages: boolean;
  updatedAt: string;
};

/**
 * Merges curated metadata with whatever the Drive folder currently contains.
 * Matching is by Drive file id first, then by source file name.
 */
export async function getLiveCatalog(): Promise<{
  products: LiveProduct[];
  categories: typeof CATEGORIES;
  source: CatalogSource;
  folder: DriveConfig;
  driveError: string | null;
  checkedAt: string;
}> {
  const folder = getDriveConfig();
  const { files, error } = await listDriveFolder();
  const byId = new Map(files.map((f) => [f.id, f]));
  const byName = new Map(files.map((f) => [f.name, f]));

  let anyLive = false;
  const products: LiveProduct[] = PRODUCTS.map((product) => {
    let live = false;
    const images = product.images.map((image) => {
      const hit = byId.get(image.driveId) ?? byName.get(product.driveFile);
      if (!hit) return image;
      live = true;
      return {
        ...image,
        src: driveImageUrl(hit.id),
        driveId: hit.id,
      };
    });
    if (live) anyLive = true;
    return {
      ...product,
      images,
      liveImages: live,
      updatedAt:
        byId.get(product.images[0]?.driveId)?.modifiedTime?.slice(0, 10) ??
        product.updatedAt,
    };
  });

  return {
    products,
    categories: CATEGORIES,
    source: anyLive ? "drive" : "local",
    folder,
    driveError: error,
    checkedAt: new Date().toISOString(),
  };
}

export async function getLiveProduct(slug: string): Promise<LiveProduct | null> {
  const { products } = await getLiveCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

export function productsByCategory(category: CategorySlug): typeof PRODUCTS {
  return PRODUCTS.filter((p) => p.category === category);
}

export function relatedProducts(slug: string, limit = 4): typeof PRODUCTS {
  const base = PRODUCTS.find((p) => p.slug === slug);
  if (!base) return PRODUCTS.slice(0, limit);
  const sameCategory = PRODUCTS.filter((p) => p.category === base.category && p.slug !== slug);
  const rest = PRODUCTS.filter((p) => p.category !== base.category && p.slug !== slug);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function searchProducts(query: string): typeof PRODUCTS {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => {
    const haystack = [
      p.name,
      p.nameEn,
      p.sku,
      p.summary,
      p.description,
      p.category,
      ...(p.colors?.map((c) => c.name) ?? []),
      ...p.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export { formatPrice } from "./format";
