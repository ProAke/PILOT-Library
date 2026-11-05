"use client";

/**
 * Thin wrapper around Capacitor so the same bundle runs untouched in a browser.
 * On the web every call is a no-op, in the iOS / Android shells it drives the
 * native status bar, splash screen, haptics and external links (LINE, tel:).
 */

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

function cap(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor ?? null;
}

export function isNative(): boolean {
  return Boolean(cap()?.isNativePlatform?.());
}

export function platform(): "ios" | "android" | "web" {
  const p = cap()?.getPlatform?.();
  if (p === "ios" || p === "android") return p;
  return "web";
}

/** Mark <html> so CSS can apply safe-area / platform tweaks. */
export function markPlatform() {
  if (typeof document === "undefined") return;
  const p = platform();
  document.documentElement.dataset.platform = p;
  if (isNative()) document.documentElement.dataset.native = "true";
}

async function load(moduleName: string): Promise<Record<string, unknown> | null> {
  if (!isNative()) return null;
  try {
    switch (moduleName) {
      case "status-bar":
        return (await import("@capacitor/status-bar")) as unknown as Record<string, unknown>;
      case "splash":
        return (await import("@capacitor/splash-screen")) as unknown as Record<string, unknown>;
      case "haptics":
        return (await import("@capacitor/haptics")) as unknown as Record<string, unknown>;
      case "app":
        return (await import("@capacitor/app")) as unknown as Record<string, unknown>;
      case "browser":
        return (await import("@capacitor/browser")) as unknown as Record<string, unknown>;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Configure the native chrome once the app boots. */
export async function bootNative() {
  markPlatform();
  if (!isNative()) return;

  const status = (await load("status-bar")) as {
    StatusBar?: {
      setStyle: (opts: { style: string }) => Promise<void>;
      setBackgroundColor?: (opts: { color: string }) => Promise<void>;
      setOverlaysWebView?: (opts: { overlay: boolean }) => Promise<void>;
    };
    Style?: Record<string, string>;
  } | null;

  try {
    await status?.StatusBar?.setStyle({ style: status.Style?.Light ?? "LIGHT" });
    if (platform() === "android") {
      await status?.StatusBar?.setOverlaysWebView?.({ overlay: false });
      await status?.StatusBar?.setBackgroundColor?.({ color: "#f7f5f1" });
    }
  } catch {
    /* older shells */
  }

  const splash = (await load("splash")) as {
    SplashScreen?: { hide: (opts?: { fadeOutDuration?: number }) => Promise<void> };
  } | null;
  try {
    await splash?.SplashScreen?.hide({ fadeOutDuration: 350 });
  } catch {
    /* ignore */
  }
}

/** Light tap feedback — silent on web. */
export async function tapFeedback() {
  if (!isNative()) return;
  const mod = (await load("haptics")) as {
    Haptics?: { impact: (opts: { style: string }) => Promise<void> };
    ImpactStyle?: Record<string, string>;
  } | null;
  try {
    await mod?.Haptics?.impact({ style: mod.ImpactStyle?.Light ?? "LIGHT" });
  } catch {
    /* ignore */
  }
}

/**
 * Open links that must leave the app (LINE, phone, Google Drive) in the system
 * browser / dialler instead of trapping the user inside the WebView.
 */
export async function openExternal(url: string) {
  if (!isNative()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const mod = (await load("browser")) as {
    Browser?: { open: (opts: { url: string }) => Promise<void> };
  } | null;
  try {
    if (mod?.Browser) {
      await mod.Browser.open({ url });
      return;
    }
  } catch {
    /* fall through */
  }
  window.location.href = url;
}

/** Hardware back button on Android: let the web history handle it first. */
export async function onBackButton(handler: () => void): Promise<() => void> {
  const mod = (await load("app")) as {
    App?: {
      addListener: (
        event: string,
        cb: (payload: { canGoBack: boolean }) => void,
      ) => Promise<{ remove: () => void }> | { remove: () => void };
      exitApp: () => Promise<void>;
    };
  } | null;
  if (!mod?.App) return () => undefined;

  const listener = await mod.App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      handler();
    } else {
      mod.App?.exitApp();
    }
  });

  return () => {
    void Promise.resolve(listener).then((l) => l?.remove?.());
  };
}
