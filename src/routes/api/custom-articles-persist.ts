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
const DATA_DIR = new URL('../../../data', import.meta.url);
const DATA_FILE = new URL('custom-articles.json', DATA_DIR);

async function saveArticles() {
  try {
	await fs.mkdir(DATA_DIR, { recursive: true });
	const tmp = new URL('custom-articles.json.tmp', DATA_DIR);
	await fs.writeFile(tmp, JSON.stringify(ARTICLES, null, 2), 'utf-8');
	await fs.rename(tmp, DATA_FILE);
  } catch (e) {
	// log in dev to help debug
	try { console.error('[custom-articles] save error', e); } catch {}
  }
}

async function loadArticles() {
  try {
	await fs.stat(DATA_FILE);
	const raw = await fs.readFile(DATA_FILE, 'utf-8');
	ARTICLES = JSON.parse(raw) as Article[];
  } catch (e: any) {
	// If file does not exist, initialize it. If parse fails, keep existing ARTICLES and log error.
	if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) {
	  ARTICLES = [];
	  try { await saveArticles(); } catch (err) { try { console.error('[custom-articles] init save error', err); } catch {} }
	} else {
	  try { console.error('[custom-articles] load error', e); } catch {}
	}
  }
}

// Initialize in background
loadArticles().catch((e) => { try { console.error('[custom-articles] loadArticles failed', e); } catch {} });

export const Route = createFileRoute("/api/custom-articles-persist")({
  server: {
	handlers: {
	  GET: async () => {
		try { return Response.json(ARTICLES); } catch (e) { return new Response('Server error', { status: 500 }); }
	  },
	  POST: async ({ request }) => {
		let parsed;
		try {
		  parsed = Body.parse(await request.json());
		} catch (err) {
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
		try { await saveArticles(); } catch (e) { try { console.error('[custom-articles] save on POST failed', e); } catch {} }
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
		  try { await saveArticles(); } catch (e) { try { console.error('[custom-articles] save on DELETE failed', e); } catch {} }
		  return new Response(null, { status: 204 });
		} catch (err) {
		  try { console.error('[custom-articles] DELETE error', err); } catch {}
		  return new Response("Invalid input", { status: 400 });
		}
	  },
	},
  },
});
