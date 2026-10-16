import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  url: z.string().url().optional(),
  title: z.string().min(1).max(500),
  category: z.string().max(50).optional(),
  needImage: z.boolean().optional(),
});

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractReadable(html: string): string {
  // Remove script/style/nav/aside/footer/header
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<(nav|aside|footer|header|form)[\s\S]*?<\/\1>/gi, "");

  // Prefer <article>...</article>
  const articleMatch = cleaned.match(/<article[\s\S]*?<\/article>/i);
  const scope = articleMatch ? articleMatch[0] : cleaned;

  // Collect <p>...</p>
  const paragraphs = Array.from(scope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 40);

  // Dedup and join
  const seen = new Set<string>();
  const unique = paragraphs.filter((p) => (seen.has(p) ? false : (seen.add(p), true)));
  return unique.slice(0, 30).join("\n\n");
}

async function generateImage(prompt: string): Promise<string | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        prompt: `Editorial news photograph illustrating: ${prompt}. Photojournalistic, high quality, cinematic lighting, no text, no watermark.`,
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: `Editorial news photograph illustrating: ${prompt}. Photojournalistic, high quality, cinematic lighting, no text, no watermark.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) return null;
    return `data:image/png;base64,${b64}`;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/article")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch {
          return new Response("Invalid input", { status: 400 });
        }
        const { url, title, category, needImage } = parsed;

        let content = "";
        if (url && url !== "#") {
          try {
            const res = await fetch(url, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (compatible; CNZA-Reader/1.0; +https://citynewsza.app)",
                Accept: "text/html,application/xhtml+xml",
              },
              signal: AbortSignal.timeout(10000),
            });
            if (res.ok) {
              const html = await res.text();
              content = extractReadable(html);
            }
          } catch {
            // ignore
          }
        }

        let image: string | null = null;
        if (needImage) {
          image = await generateImage(`${title}${category ? ` (${category} news, South Africa)` : ""}`);
        }

        return Response.json({ content, image });
      },
    },
  },
});
