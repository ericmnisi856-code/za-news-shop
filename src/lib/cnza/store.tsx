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
  addArticle: (a: { title: string; content: string; category: Category; image?: string }) => void;
  deleteArticle: (id: string) => void;
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
    window.dispatchEvent(new CustomEvent(`cnza:${key}`));
  }, [key, v]);
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) setV(JSON.parse(raw) as T);
      } catch {}
    };
    window.addEventListener(`cnza:${key}`, handler);
    return () => window.removeEventListener(`cnza:${key}`, handler);
  }, [key]);
  return [v, setV];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocal<Product[]>("cnza_products", SEED_PRODUCTS);
  const [customArticles, setCustomArticles] = useLocal<NewsArticle[]>("cnza_custom_articles", []);
  const [cart, setCart] = useLocal<CartItem[]>("cnza_cart", []);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...p, id: `p_${Date.now()}` }]);
  }, [setProducts]);
  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, [setProducts]);
  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [setProducts]);

  const addArticle = useCallback((a: { title: string; content: string; category: Category; image?: string }) => {
    const article: NewsArticle = {
      id: `custom_${Date.now()}`,
      title: a.title,
      excerpt: a.content.slice(0, 240),
      content: a.content,
      image: a.image || `https://picsum.photos/seed/${encodeURIComponent(a.title)}/800/500`,
      source: "CityNewsZA",
      link: "#",
      category: a.category,
      author: "CityNewsZA",
      publishedAt: new Date().toISOString(),
      truncated: false,
      custom: true,
    };
    setCustomArticles((prev) => [article, ...prev]);
  }, [setCustomArticles]);
  const deleteArticle = useCallback((id: string) => {
    setCustomArticles((prev) => prev.filter((a) => a.id !== id));
  }, [setCustomArticles]);

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
