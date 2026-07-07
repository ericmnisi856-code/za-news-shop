import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().max(50).optional(),
  image: z.string().optional(),
});

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  source: string;
  link: string;
  category?: string;
  author: string;
  publishedAt: string;
  truncated: boolean;
  custom: boolean;
};

const STORE_NAME = "cnza-articles";
const KEY = "articles.json";

// In-memory fallback for local dev when Netlify Blobs is unavailable.
let MEM: Article[] = [];

async function getStore() {
  try {
    const mod = await import("@netlify/blobs");
    return mod.getStore({ name: STORE_NAME, consistency: "strong" });
  } catch {
    return null;
  }
}

async function loadAll(): Promise<Article[]> {
  const store = await getStore();
  if (!store) return MEM;
  try {
    const data = await store.get(KEY, { type: "json" });
    return (data as Article[] | null) ?? [];
  } catch {
    return MEM;
  }
}

async function saveAll(articles: Article[]): Promise<void> {
  MEM = articles;
  const store = await getStore();
  if (!store) return;
  try {
    await store.setJSON(KEY, articles);
  } catch (e) {
    console.error("[articles] Blob save error:", e);
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/custom-articles-persist")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        const articles = await loadAll();
        return new Response(JSON.stringify(articles), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS },
        });
      },
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch {
          return new Response("Invalid input", { status: 400, headers: CORS });
        }
        const { title, content, category, image } = parsed;
        const article: Article = {
          id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          title,
          excerpt: content.slice(0, 240),
          content,
          image: image || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/500`,
          source: "CityNewsZA",
          link: "#",
          category,
          author: "CityNewsZA",
          publishedAt: new Date().toISOString(),
          truncated: false,
          custom: true,
        };
        const current = await loadAll();
        const next = [article, ...current];
        await saveAll(next);
        return new Response(JSON.stringify(article), {
          status: 201,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      },
      DELETE: async ({ request }) => {
        try {
          const body = await request.json();
          const id = body?.id;
          if (!id) return new Response("Missing id", { status: 400, headers: CORS });
          const current = await loadAll();
          const next = current.filter((a) => a.id !== id);
          if (next.length === current.length) {
            return new Response("Not found", { status: 404, headers: CORS });
          }
          await saveAll(next);
          return new Response(null, { status: 204, headers: CORS });
        } catch {
          return new Response("Error", { status: 400, headers: CORS });
        }
      },
    },
  },
});
