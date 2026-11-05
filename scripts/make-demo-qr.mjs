#!/usr/bin/env node
/**
 * Generates the QR code used by /demo (and the docs) for a given URL.
 *
 *   npm run demo:qr                       # uses NEXT_PUBLIC_DEMO_URL or the default
 *   npm run demo:qr -- https://xxxx.e2b.app
 *   npm run demo:qr -- https://xxxx.e2b.app --out public/demo/qr.png
 */
import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const url =
  args.find((a) => !a.startsWith("--")) ??
  process.env.NEXT_PUBLIC_DEMO_URL ??
  "https://pilot-library.vercel.app";
const outFlag = args.findIndex((a) => a === "--out");
const out =
  outFlag >= 0 && args[outFlag + 1] ? args[outFlag + 1] : "public/demo/qr.png";

await mkdir(path.dirname(out), { recursive: true });
await QRCode.toFile(out, url, {
  width: 1024,
  margin: 2,
  color: { dark: "#121820", light: "#f7f5f1" },
  errorCorrectionLevel: "M",
});
console.log(`✓ ${url}\n→ ${out}`);
