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

let ARTICLES: Article[] = [];
let DB_READY = false;

async function ensureDb() {
  if (DB_READY) return;
  try {
    const sqlite3 = await import("better-sqlite3");
    const Database = sqlite3.default;
    const dbPath = new URL("../../../articles.db", import.meta.url).pathname;
    const db = new Database(dbPath);
    db.exec(CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, data TEXT NOT NULL));
    const rows = db.prepare("SELECT data FROM articles ORDER BY json_extract(data, '$.publishedAt') DESC").all() as any[];
    ARTICLES = rows.map(r => JSON.parse(r.data) as Article);
    (globalThis as any).__articlesDb = db;
    DB_READY = true;
    console.log("[articles] SQLite ready, loaded", ARTICLES.length, "articles");
  } catch (e) {
    console.warn("[articles] SQLite not available, using in-memory only");
    DB_READY = true;
  }
}

ensureDb().catch(() => { DB_READY = true; });

export const Route = createFileRoute("/api/custom-articles-persist")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(ARTICLES);
      },
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch {
          return new Response("Invalid input", { status: 400 });
        }
        const { title, content, category, image } = parsed;
        const article: Article = {
          id: custom_Start-Sleep -Seconds 1; Get-ChildItem src/routes/api/{Date.now()},
          title,
          excerpt: content.slice(0, 240),
          content,
          image: image || https://picsum.photos/seed/Start-Sleep -Seconds 1; Get-ChildItem src/routes/api/{encodeURIComponent(title)}/800/500,
          source: "CityNewsZA",
          link: "#",
          category,
          author: "CityNewsZA",
          publishedAt: new Date().toISOString(),
          truncated: false,
          custom: true,
        };
        ARTICLES = [article, ...ARTICLES];
        try {
          const db = (globalThis as any).__articlesDb;
          if (db) {
            db.prepare("INSERT OR REPLACE INTO articles (id, data) VALUES (?, ?)").run(
              article.id,
              JSON.stringify(article)
            );
            console.log("[articles] Saved", article.id);
          }
        } catch (e) {
          console.error("[articles] Save error:", e);
        }
        return Response.json(article, { status: 201 });
      },
      DELETE: async ({ request }) => {
        try {
          const body = await request.json();
          const id = body?.id;
          if (!id) return new Response("Missing id", { status: 400 });
          const prevLen = ARTICLES.length;
          ARTICLES = ARTICLES.filter(a => a.id !== id);
          if (ARTICLES.length === prevLen) return new Response("Not found", { status: 404 });
          try {
            const db = (globalThis as any).__articlesDb;
            if (db) {
              db.prepare("DELETE FROM articles WHERE id = ?").run(id);
              console.log("[articles] Deleted", id);
            }
          } catch (e) {
            console.error("[articles] Delete error:", e);
          }
          return new Response(null, { status: 204 });
        } catch (e) {
          return new Response("Error", { status: 400 });
        }
      },
    },
  },
});
