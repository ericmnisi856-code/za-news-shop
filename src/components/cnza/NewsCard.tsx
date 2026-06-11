import type { NewsArticle } from "@/lib/cnza/types";
import { ExternalLink } from "lucide-react";

const sourceColors: Record<string, string> = {
  CityNewsZA: "bg-accent text-accent-foreground",
};

export function NewsCard({ article }: { article: NewsArticle }) {
  const badgeCls = sourceColors[article.source] ?? "bg-primary text-primary-foreground";
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(article.id)}/800/500`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={article.image || fallback}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { const img = e.currentTarget as HTMLImageElement; if (img.src !== fallback) img.src = fallback; }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className={`rounded-sm px-1.5 py-0.5 font-bold uppercase tracking-wider ${badgeCls}`}>{article.source}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{article.category}</span>
        </div>
        <h3 className="font-serif text-lg font-semibold leading-snug group-hover:text-accent">{article.title}</h3>
        <div className="relative">
          <p className={`text-sm text-muted-foreground ${article.truncated ? "line-clamp-3 fade-mask" : "line-clamp-4"}`}>
            {article.excerpt}
          </p>
        </div>
        {article.truncated && (
          <p className="text-[11px] italic text-muted-foreground">Preview truncated — read full article at source.</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>By {article.author}</span>
          {article.link && article.link !== "#" ? (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-accent">
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="font-semibold">CNZA Original</span>
          )}
        </div>
      </div>
    </article>
  );
}
