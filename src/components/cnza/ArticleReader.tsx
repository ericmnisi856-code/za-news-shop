import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { NewsArticle } from "@/lib/cnza/types";
import { ExternalLink, X } from "lucide-react";

interface Props {
  article: NewsArticle | null;
  onClose: () => void;
}

export function ArticleReader({ article, onClose }: Props) {
  const open = !!article;
  const fallback = article ? `https://picsum.photos/seed/${encodeURIComponent(article.id)}/1400/800` : "";
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card">
        {article && (
          <article className="animate-in fade-in zoom-in-95 duration-300">
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <img
                src={article.image || fallback}
                alt={article.title}
                className="h-full w-full object-cover"
                onError={(e) => { const img = e.currentTarget as HTMLImageElement; if (img.src !== fallback) img.src = fallback; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-sm bg-accent px-2 py-1 font-bold uppercase tracking-wider text-accent-foreground">{article.category}</span>
                <span className="text-muted-foreground">{article.source}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{new Date(article.publishedAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">{article.title}</h1>
              <p className="text-sm text-muted-foreground">By {article.author}</p>
              <div className="prose prose-invert max-w-none text-base leading-relaxed text-foreground/90">
                {(article.content ?? article.excerpt).split(/\n+/).map((p, i) => (
                  <p key={i} className="mb-4">{p}</p>
                ))}
              </div>
              {article.truncated && article.link && article.link !== "#" && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                  This is a preview from <strong>{article.source}</strong>. Continue reading the full story at the original publisher.
                </div>
              )}
              {article.link && article.link !== "#" && (
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  View original source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </article>
        )}
      </DialogContent>
    </Dialog>
  );
}
