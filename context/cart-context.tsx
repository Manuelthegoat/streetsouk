import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type CartItem = {
  key: string; // product + size
  productId: string;
  size: string | null;
  qty: number;
  stock: number; // how many were available when it was added
  name: string;
  brand: string;
  vendorSlug: string;
  price: number;
  image: string | null;
};

type NewItem = Omit<CartItem, "key" | "qty">;

type CartValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: NewItem) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "ss-cart:v1";
const MAX_QTY = 10;
const Ctx = createContext<CartValue | null>(null);

// carts saved before stock existed have no limit stored
const limitOf = (item: { stock?: number }) =>
  Math.min(MAX_QTY, item.stock ?? MAX_QTY);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const saved = JSON.parse(raw) as CartItem[];
            setItems((cur) => (cur.length > 0 ? cur : saved));
          } catch {
            // ignore a corrupted cart
          }
        }
        hydrated.current = true;
      })
      .catch(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(
      () => undefined,
    );
  }, [items]);

  const add = useCallback((item: NewItem) => {
    const key = `${item.productId}:${item.size ?? ""}`;
    setItems((cur) => {
      const existing = cur.find((i) => i.key === key);
      if (existing) {
        return cur.map((i) =>
          i.key === key
            ? {
                ...i,
                stock: item.stock,
                qty: Math.min(limitOf(item), i.qty + 1),
              }
            : i,
        );
      }
      if (item.stock <= 0) return cur;
      return [...cur, { ...item, key, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((cur) =>
      qty <= 0
        ? cur.filter((i) => i.key !== key)
        : cur.map((i) =>
            i.key === key ? { ...i, qty: Math.min(limitOf(i), qty) } : i,
          ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((cur) => cur.filter((i) => i.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}