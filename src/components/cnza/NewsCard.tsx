import type { NewsArticle } from "@/lib/cnza/types";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/cnza/fallbackImage";

const sourceColors: Record<string, string> = {
  CityNewsZA: "bg-accent text-accent-foreground",
};

interface Props {
  article: NewsArticle;
  onOpen: (a: NewsArticle) => void;
}

export function NewsCard({ article, onOpen }: Props) {
  const badgeCls = sourceColors[article.source] ?? "bg-primary text-primary-foreground";
  const [failed, setFailed] = useState(false);
  const src = !article.image || failed ? FALLBACK_IMAGE : article.image;
  return (
    <article
      onClick={() => onOpen(article)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-2xl hover:shadow-accent/10"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={src}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className={`rounded-sm px-1.5 py-0.5 font-bold uppercase tracking-wider ${badgeCls}`}>{article.source}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{article.category}</span>
        </div>
        <h3 className="font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-accent">{article.title}</h3>
        <p className={`text-sm text-muted-foreground ${article.truncated ? "line-clamp-3 fade-mask" : "line-clamp-4"}`}>
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>By {article.author}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
            Read in app <ArrowUpRight className="h-3 w-3 transition-transform group-hover:rotate-45" />
          </span>
        </div>
      </div>
    </article>
  );
}
