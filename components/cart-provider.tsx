"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SavedItem = {
  slug: string;
  name: string;
  price: number | null;
  image: string;
  size?: string;
  color?: string;
  qty: number;
};

type CartState = {
  items: SavedItem[];
  ready: boolean;
  count: number;
  add: (item: Omit<SavedItem, "qty">, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "pilot-library.inquiry.v1";

const keyOf = (i: { slug: string; size?: string; color?: string }) =>
  [i.slug, i.size ?? "", i.color ?? ""].join("|");

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedItem[];
        if (Array.isArray(parsed)) setItems(parsed.filter((i) => i && i.slug));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / private mode */
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<SavedItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const k = keyOf(item);
      const existing = prev.find((p) => keyOf(p) === k);
      if (existing) {
        return prev.map((p) =>
          keyOf(p) === k ? { ...p, qty: Math.min(99, p.qty + qty) } : p,
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((p) => keyOf(p) !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => keyOf(p) !== key)
        : prev.map((p) => (keyOf(p) === key ? { ...p, qty: Math.min(99, qty) } : p)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartState>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      add,
      remove,
      setQty,
      clear,
      has: (slug: string) => items.some((i) => i.slug === slug),
    }),
    [items, ready, add, remove, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export { keyOf as cartItemKey };
