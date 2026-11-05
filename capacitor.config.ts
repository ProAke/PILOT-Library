import type { CapacitorConfig } from "@capacitor/cli";

/**
 * PILOT Library — native shell configuration
 * ------------------------------------------
 * The app ships its catalogue inside the bundle (static export in `out/`), so it
 * opens instantly and works without a signal.
 *
 * Point `server.url` at the deployed web shop to run the native shell against
 * the live Google Drive data while developing — use `CAP_SERVER_URL`.
 */
const devUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.pilotlibrary.catalogue",
  appName: "PILOT Library",
  webDir: "out",
  ...(devUrl
    ? {
        server: {
          url: devUrl,
          cleartext: devUrl.startsWith("http://"),
        },
      }
    : {}),
  ios: {
    contentInset: "always",
    backgroundColor: "#f7f5f1",
    preferredContentMode: "mobile",
    scheme: "pilotlibrary",
  },
  android: {
    backgroundColor: "#f7f5f1",
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: false,
      backgroundColor: "#f7f5f1",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f7f5f1",
      overlaysWebView: false,
    },
  },
};

export default config;
