"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { bootNative, isNative, onBackButton, tapFeedback } from "@/lib/native";
import styles from "./app-shell.module.css";

/**
 * Bottom tab bar shown in the installed app (iOS / Android shell or PWA
 * standalone). On a normal desktop browser it stays hidden so the site keeps
 * its catalogue layout.
 */
export function AppTabBar() {
  const pathname = usePathname();
  const { count } = useCart();
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNative());
    void bootNative();
    if (isNative()) {
      const cleanup = onBackButton(() => window.history.back());
      return () => {
        void cleanup.then((fn) => fn());
      };
    }
  }, []);

  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/shop", label: "Shop", icon: GridIcon },
    { href: "/search", label: "Search", icon: SearchIcon },
    { href: "/inquiry", label: "Bag", icon: BagIcon, badge: count },
    { href: "/journal", label: "About", icon: InfoIcon },
  ];

  return (
    <nav className={styles.tabbar} aria-label="เมนูแอป" data-native={native ? "true" : undefined}>
      {tabs.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={() => void tapFeedback()}
          >
            <span className={styles.iconWrap}>
              <Icon />
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className={styles.badge}>{tab.badge}</span>
              )}
            </span>
            <span className={styles.label}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Wraps the tab bar in Suspense so static pages can be exported. */
export function AppShell() {
  return (
    <Suspense fallback={null}>
      <AppTabBar />
    </Suspense>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 20v-5h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <path
        d="M5 7h14l-1.1 13.2a1 1 0 0 1-1 .8H7.1a1 1 0 0 1-1-.8L5 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 7V5.6A3 3 0 0 1 12 2.6a3 3 0 0 1 3 3V7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" />
    </svg>
  );
}
