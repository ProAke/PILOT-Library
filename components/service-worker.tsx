"use client";

import { useEffect } from "react";

/** Registers the offline shell so the catalogue opens without a connection. */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    const timer = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline shell is a nice-to-have */
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
