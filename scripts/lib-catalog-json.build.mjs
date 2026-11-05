// Emits lib/catalog-json.mjs (plain ESM) from the TypeScript source so build
// scripts can reuse the exact same payload shape the API returns.
import { build } from "esbuild";

await build({
  entryPoints: ["lib/catalog-json.ts"],
  outfile: "lib/catalog-json.mjs",
  bundle: true,
  format: "esm",
  platform: "node",
  alias: { "@": process.cwd() },
  logLevel: "silent",
});
