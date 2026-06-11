import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FEEDS } from "./feeds";
import type { Category, NewsArticle } from "./types";

const CATS = ["Politics", "Sports", "Technology"] as const;

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "…");
}

function stripHtml(s: string) {
  return decode(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function pick(tag: string, block: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1] : undefined;
}

function extractImage(block: string): string | undefined {
  const enc = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enc) return enc[1];
  const media = block.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
  if (media) return media[1];
  const desc = pick("description", block) ?? pick("content:encoded", block) ?? "";
  const img = decode(desc).match(/<img[^>]+src=["']([^"']+)["']/i);
  if (img) return img[1];
  return undefined;
}

async function parseFeed(url: string, source: string, category: Category): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 CNZA/1.0", Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
    return items.slice(0, 12).map((block, i) => {
      const title = stripHtml(pick("title", block) ?? "Untitled");
      const link = stripHtml(pick("link", block) ?? "#");
      const rawDesc = pick("description", block) ?? pick("content:encoded", block) ?? "";
      const excerpt = stripHtml(rawDesc).slice(0, 220);
      const pubDate = stripHtml(pick("pubDate", block) ?? new Date().toISOString());
      const id = `${source}-${i}-${link.slice(-40)}`;
      const image = extractImage(block); // undefined when the feed has no real image
      return {
        id,
        title,
        excerpt,
        image,
        source,
        link,
        category,
        author: "CityNewsZA",
        publishedAt: new Date(pubDate || Date.now()).toISOString(),
        truncated: excerpt.length >= 200,
      } satisfies NewsArticle;
    });
  } catch {
    return [];
  }
}

function fallbackArticles(category: Category): NewsArticle[] {
  const topics: Record<Category, string[]> = {
    Politics: ["Coalition talks intensify ahead of provincial vote", "Parliament debates new energy bill", "Local government reforms unveiled"],
    Sports: ["Springboks confirm squad for end-of-year tour", "Proteas chase historic series win", "PSL title race tightens after weekend draws"],
    Technology: ["South African startup raises Series A for fintech", "Load-shedding spurs solar tech adoption", "AI research hub opens in Cape Town"],
    Business: ["Rand strengthens against the dollar on global cues", "JSE all-share index hits new high", "SARB holds repo rate steady"],
    Leisure: ["Top weekend restaurant openings in Joburg", "A guide to the Western Cape wine harvest", "Five hidden hiking trails near Durban"],
  };
  return topics[category].map((title, i) => ({
    id: `fallback-${category}-${i}`,
    title,
    excerpt: `${title}. A CityNewsZA editorial brief covering the latest developments, context and what to watch next…`,
    image: `https://picsum.photos/seed/${encodeURIComponent(category + i)}/800/500`,
    source: "CityNewsZA",
    link: "#",
    category,
    author: "CityNewsZA",
    publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    truncated: true,
  }));
}

export const fetchNews = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ category: z.enum(CATS).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<NewsArticle[]> => {
    const cats: Category[] = data.category ? [data.category] : [...CATS];
    const results = await Promise.all(
      cats.flatMap((cat) =>
        FEEDS[cat].map((f) => parseFeed(f.url, f.name, cat)),
      ),
    );
    let articles = results.flat();
    // Add fallbacks for categories with no results
    for (const cat of cats) {
      if (!articles.some((a) => a.category === cat)) {
        articles = articles.concat(fallbackArticles(cat));
      }
    }
    articles.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    // When no specific category requested, surface SA Politics first in the headline feed
    if (!data.category) {
      const politics = articles.filter((a) => a.category === "Politics");
      const rest = articles.filter((a) => a.category !== "Politics");
      articles = [...politics.slice(0, 8), ...rest, ...politics.slice(8)];
    }
    return articles;
  });
