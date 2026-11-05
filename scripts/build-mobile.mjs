#!/usr/bin/env node
/**
 * Builds the static export consumed by the Capacitor iOS / Android shells.
 *
 * The native app is fully offline-capable: it bundles the catalogue and its
 * imagery, so the JSON API handlers (app/api/**) are parked for the duration of
 * this build — a static export cannot host them, and Next's exporter chokes on
 * route handlers that also need a dynamic server.
 */
import { execSync } from "node:child_process";
import { rename, rm, mkdir, cp, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "app", "api");
const parked = path.join(root, ".build-stash", "api");

console.log("→ parking API routes (not part of the native bundle)");
await mkdir(path.join(root, ".build-stash"), { recursive: true });
if (existsSync(parked)) await rm(parked, { recursive: true, force: true });
if (existsSync(apiDir)) await rename(apiDir, parked);

try {
  await rm(path.join(root, "out"), { recursive: true, force: true });
  console.log("→ next build (static export)");
  execSync("npx next build", {
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "mobile" },
  });
} finally {
  if (existsSync(parked)) await rename(parked, apiDir);
  console.log("→ API routes restored");
}

// Build stamp + catalogue JSON for QA tooling
const out = path.join(root, "out");
const catalog = await import(path.join(root, "lib", "catalog-json.mjs"))
  .then((m) => m.catalogPayload())
  .catch(() => null);

await mkdir(path.join(out, "api", "products"), { recursive: true });
if (catalog) {
  await writeFile(
    path.join(out, "api", "products", "index.json"),
    JSON.stringify(catalog, null, 2),
    "utf8",
  );
}
const stamp = {
  app: "PILOT Library",
  target: "mobile",
  builtAt: new Date().toISOString(),
  products: catalog?.count ?? null,
};
await writeFile(path.join(out, "build-info.json"), JSON.stringify(stamp, null, 2), "utf8");
console.log(`✓ static export ready (${stamp.products ?? "?"} products)`);
