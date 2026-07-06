import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { CartItem, NewsArticle, Product, Category } from "./types";

const SEED_PRODUCTS: Product[] = [
  { id: "p1", title: "The State of SA Politics 2026", price: 185, description: "An in-depth analysis of South Africa's evolving political coalition landscape.", category: "Politics", stock: 50, cover: "https://picsum.photos/seed/sa-politics/600/800" },
  { id: "p2", title: "Tech Horizon: Africa's AI Boom", price: 220, description: "A masterclass guide to how tech hubs in Johannesburg and Cape Town are leading AI adoption.", category: "Technology", stock: 50, cover: "https://picsum.photos/seed/ai-boom/600/800" },
  { id: "p3", title: "Springbok Glory: A Masterclass in Teamwork", price: 150, description: "Behind-the-scenes strategy rules from South Africa's legendary rugby triumphs.", category: "Sports", stock: 50, cover: "https://picsum.photos/seed/springbok/600/800" },
  { id: "p4", title: "Unlocking SA Micro-Markets", price: 310, description: "A practical business guide for entrepreneurs navigating local economic shifts.", category: "Business", stock: 50, cover: "https://picsum.photos/seed/micro-markets/600/800" },
];

type Ctx = {
  products: Product[];
  customArticles: NewsArticle[];
  cart: CartItem[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addArticle: (a: { title: string; content: string; category: Category; image?: string }) => Promise<void> | void;
  deleteArticle: (id: string) => Promise<void> | void;
  addToCart: (productId: string, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

function useLocal<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
    // notify other tabs / same tab listeners
    try { window.dispatchEvent(new CustomEvent(`cnza:${key}`)); } catch {}
  }, [key, v]);
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) setV(JSON.parse(raw) as T);
      } catch {}
    };
    try { window.addEventListener(`cnza:${key}`, handler); } catch {}
    return () => { try { window.removeEventListener(`cnza:${key}`, handler); } catch {} };
  }, [key]);
  return [v, setV];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocal<Product[]>("cnza_products", SEED_PRODUCTS);
  const [customArticles, setCustomArticles] = useState<NewsArticle[]>([]);
  const [cart, setCart] = useLocal<CartItem[]>("cnza_cart", []);

  // load custom articles from server on mount only (once)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/custom-articles-persist");
        if (res.ok) {
          const json = (await res.json()) as NewsArticle[];
          setCustomArticles(json);
        }
      } catch (e) {
        console.error("[store] Failed to load articles from server");
      }
    };
    fetchArticles();
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...p, id: `p_${Date.now()}` }]);
  }, [setProducts]);
  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, [setProducts]);
  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [setProducts]);

  const addArticle = useCallback(async (a: { title: string; content: string; category: Category; image?: string }) => {
    // Always publish to server and update from response (server is authoritative)
    try {
      const res = await fetch("/api/custom-articles-persist", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(a) 
      });
      if (res.ok) {
        const created = (await res.json()) as NewsArticle;
        setCustomArticles((prev) => [created, ...prev]);
        return;
      }
    } catch (e) {
      console.error("[store] Failed to publish article to server");
    }
  }, []);

  const deleteArticle = useCallback(async (id: string) => {
    // Always delete from server (server is authoritative)
    try {
      const res = await fetch("/api/custom-articles-persist", { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id }) 
      });
      if (res.status === 204) {
        setCustomArticles((prev) => prev.filter((a) => a.id !== id));
        return;
      }
    } catch (e) {
      console.error("[store] Failed to delete article from server");
    }
  }, []);

  const addToCart = useCallback((productId: string, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) return prev.map((c) => c.productId === productId ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { productId, quantity: qty }];
    });
  }, [setCart]);
  const updateQty = useCallback((productId: string, quantity: number) => {
    setCart((prev) => quantity <= 0 ? prev.filter((c) => c.productId !== productId) : prev.map((c) => c.productId === productId ? { ...c, quantity } : c));
  }, [setCart]);
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, [setCart]);
  const clearCart = useCallback(() => setCart([]), [setCart]);

  return (
    <StoreContext.Provider value={{
      products, customArticles, cart,
      addProduct, updateProduct, deleteProduct,
      addArticle, deleteArticle,
      addToCart, updateQty, removeFromCart, clearCart,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

export function formatR(n: number) {
  return `R${n.toFixed(2)}`;
}
