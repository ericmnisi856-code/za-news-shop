import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { promises as fs } from "fs";

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

// Persisted store for custom articles. Stored in ./data/custom-articles.json
let ARTICLES: Article[] = [];
const DATA_FILE = new URL('../../../data/custom-articles.json', import.meta.url);

async function saveArticles() {
  try {
	await fs.mkdir(new URL('../../../data', import.meta.url), { recursive: true });
	await fs.writeFile(DATA_FILE, JSON.stringify(ARTICLES, null, 2), 'utf-8');
  } catch (e) {
	// ignore write errors in dev
  }
}

async function loadArticles() {
  try {
	const raw = await fs.readFile(DATA_FILE, 'utf-8');
	ARTICLES = JSON.parse(raw) as Article[];
  } catch (e) {
	ARTICLES = [];
	try { await saveArticles(); } catch {}
  }
}

// Initialize in background
loadArticles().catch(() => {});

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
		  id: `custom_${Date.now()}`,
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
		ARTICLES = [article, ...ARTICLES];
		try { await saveArticles(); } catch {}
		return Response.json(article, { status: 201 });
	  },
	  DELETE: async ({ request }) => {
		try {
		  const body = await request.json();
		  const id = body?.id;
		  if (!id) return new Response("Missing id", { status: 400 });
		  const prevLen = ARTICLES.length;
		  ARTICLES = ARTICLES.filter((a) => a.id !== id);
		  if (ARTICLES.length === prevLen) return new Response("Not found", { status: 404 });
		  try { await saveArticles(); } catch {}
		  return new Response(null, { status: 204 });
		} catch {
		  return new Response("Invalid input", { status: 400 });
		}
	  },
	},
  },
});
