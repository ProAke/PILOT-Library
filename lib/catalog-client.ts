"use client";

/**
 * Client-side catalogue store.
 *
 * The mobile bundles (iOS / Android) are built as a static export and ship
 * `data/products.ts` inside the app, so the catalogue opens instantly and works
 * with no signal. At runtime the app can also refresh product photos from the
 * published JSON API (`/api/products`) — that is how the Google Drive folder
 * stays the single source of truth for imagery after release.
 */

import { useEffect, useState } from "react";
import { PRODUCTS, type Product } from "@/data/products";

/** Origin of the deployed web shop / catalogue API (returns Drive-backed photos). */
export const CATALOG_API_BASE =
  process.env.NEXT_PUBLIC_CATALOG_API ?? "https://pilot-library.vercel.app";

const CACHE_KEY = "pilot-library.catalog.v1";
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

type CachePayload = {
  fetchedAt: number;
  products: Record<string, { images: Product["images"]; price: number | null }>;
};

function readCache(): CachePayload | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload;
    if (!parsed?.products) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(payload: CachePayload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* storage full / private mode */
  }
}

/** Merge API overrides (live Drive image URLs, updated prices) into the bundle. */
function applyOverrides(
  products: Product[],
  overrides: CachePayload["products"] | null,
): Product[] {
  if (!overrides) return products;
  return products.map((product) => {
    const hit = overrides[product.slug];
    if (!hit) return product;
    return {
      ...product,
      images: hit.images?.length ? hit.images : product.images,
      price: hit.price ?? product.price,
    };
  });
}

let memory: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

export function getCatalog(): Product[] {
  if (memory) return memory;
  memory = applyOverrides(PRODUCTS, readCache()?.products ?? null);
  return memory;
}

export async function refreshCatalog(): Promise<Product[]> {
  if (inflight) return inflight;
  inflight = (async () => {
    const cached = readCache();
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      memory = applyOverrides(PRODUCTS, cached.products);
      return memory;
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${CATALOG_API_BASE}/api/products`, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`catalog ${res.status}`);
      const json = (await res.json()) as {
        products?: { slug: string; price: number | null; images: Product["images"] }[];
      };
      const overrides: CachePayload["products"] = {};
      for (const p of json.products ?? []) {
        if (p?.slug) overrides[p.slug] = { images: p.images ?? [], price: p.price ?? null };
      }
      writeCache({ fetchedAt: Date.now(), products: overrides });
      memory = applyOverrides(PRODUCTS, overrides);
      return memory;
    } catch {
      memory = applyOverrides(PRODUCTS, cached?.products ?? null);
      return memory;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Hook: catalogue with a background refresh from the Drive-backed API. */
export function useCatalog(): { products: Product[]; live: boolean } {
  const [products, setProducts] = useState<Product[]>(() => getCatalog());
  const [live, setLive] = useState(false);

  useEffect(() => {
    let done = false;
    refreshCatalog().then((next) => {
      if (done) return;
      setProducts(next);
      setLive(next.some((p) => p.images.some((i) => i.src.includes("lh3.googleusercontent.com"))));
    });
    return () => {
      done = true;
    };
  }, []);

  return { products, live };
}

export function useProduct(slug: string): Product | undefined {
  const { products } = useCatalog();
  return products.find((p) => p.slug === slug) ?? PRODUCTS.find((p) => p.slug === slug);
}

export function relatedTo(slug: string, limit = 4): Product[] {
  const list = getCatalog();
  const base = list.find((p) => p.slug === slug);
  if (!base) return list.slice(0, limit);
  return list
    .filter((p) => p.slug !== slug && p.category === base.category)
    .concat(list.filter((p) => p.category !== base.category))
    .slice(0, limit);
}
