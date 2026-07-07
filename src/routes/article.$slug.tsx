import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { FALLBACK_IMAGE } from "@/lib/cnza/fallbackImage";

const SITE_URL = "https://citynewsza.co.za";

const searchSchema = z.object({
  t: z.string().optional(), // title
  d: z.string().optional(), // description/excerpt
  img: z.string().optional(), // image url (absolute)
  src: z.string().optional(), // source name
  cat: z.string().optional(), // category
  url: z.string().optional(), // original article link
});

function absoluteImage(img: string | undefined) {
  if (!img) return `${SITE_URL}/cnza-og-default.png`;
  if (/^https?:\/\//i.test(img)) return img;
  if (img.startsWith("/")) return `${SITE_URL}${img}`;
  return img;
}

export const Route = createFileRoute("/article/$slug")({
  validateSearch: (s) => searchSchema.parse(s),
  head: ({ params, search }) => {
    const title = search.t?.slice(0, 140) ?? "City News ZA article";
    const description = (search.d ?? "Read the full story on City News ZA — South African news, politics, sports, tech and more.").slice(0, 280);
    const image = absoluteImage(search.img);
    const canonical = `${SITE_URL}/article/${params.slug}`;
    return {
      meta: [
        { title: `${title} — City News ZA` },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:image:secure_url", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: "City News ZA" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: ArticlePreviewPage,
});

function ArticlePreviewPage() {
  const search = Route.useSearch();
  const title = search.t ?? "City News ZA";
  const description = search.d ?? "";
  const image = search.img || FALLBACK_IMAGE;
  const source = search.src ?? "CityNewsZA";
  const category = search.cat ?? "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-serif text-xl font-bold">City News ZA</Link>
          <Link to="/" className="text-sm font-semibold text-accent hover:underline">Back to home →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <article className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {category && (
                <span className="rounded-sm bg-accent px-2 py-1 font-bold uppercase tracking-wider text-accent-foreground">
                  {category}
                </span>
              )}
              <span className="text-muted-foreground">{source}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">{title}</h1>
            {description && <p className="text-base leading-relaxed text-foreground/90">{description}</p>}

            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Read the full story on City News ZA
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
