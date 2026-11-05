/**
 * Where the phone demo lives.
 *
 * The web shop is the demo: open it on a phone, or install it to the home
 * screen (PWA) — or run the native iOS / Android shells from `ios/` & `android/`.
 *
 * Override with NEXT_PUBLIC_DEMO_URL at build time (e.g. the sandbox preview URL
 * https://3000-<sandbox>.e2b.app while reviewing on a phone).
 */
export const DEMO = {
  /** Live preview (sandbox) baked in at build time; override per deploy. */
  url:
    process.env.NEXT_PUBLIC_DEMO_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://3000-iudurdmmaz8mhutdzo81h.e2b.app",
  /** Native shells that can be built from this repo */
  native: [
    {
      platform: "iOS",
      requirement: "macOS + Xcode 16",
      steps: ["npm run mobile:sync", "npm run mobile:ios", "Run ▶ on a device or simulator"],
    },
    {
      platform: "Android",
      requirement: "Android Studio (AGP 8.x, JDK 21)",
      steps: ["npm run mobile:sync", "npm run mobile:android", "Run ▶ on a device or emulator"],
    },
  ],
} as const;
