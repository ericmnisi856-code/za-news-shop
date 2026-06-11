import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { NewsArticle } from "@/lib/cnza/types";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/cnza/fallbackImage";

interface Props {
  article: NewsArticle | null;
  onClose: () => void;
}

interface FetchedData {
  content: string;
  image: string | null;
}

export function ArticleReader({ article, onClose }: Props) {
  const open = !!article;
  const [fetched, setFetched] = useState<FetchedData | null>(null);
  const [loading, setLoading] = useState(false);

  const needsImage = !article?.image;
  const heroImage = fetched?.image || article?.image || "";
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!article) {
      setFetched(null);
      return;
    }
    // Reset for new article
    setFetched(null);

    const hasFullContent = (article.content?.length ?? 0) > 400;
    const shouldFetchBody = !hasFullContent && !!article.link && article.link !== "#" && !article.custom;
    const shouldGenImage = needsImage && !article.custom;

    if (!shouldFetchBody && !shouldGenImage) return;

    let cancelled = false;
    setLoading(true);
    fetch("/api/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: shouldFetchBody ? article.link : undefined,
        title: article.title,
        category: article.category,
        needImage: shouldGenImage,
      }),
    })
      .then((r) => (r.ok ? r.json() : { content: "", image: null }))
      .then((data: FetchedData) => {
        if (!cancelled) setFetched(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [article, needsImage]);

  useEffect(() => {
    setImgFailed(false);
  }, [article?.id, fetched?.image]);

  const body = (fetched?.content && fetched.content.length > 200 ? fetched.content : null) ?? article?.content ?? article?.excerpt ?? "";
  const showHeroImg = !!heroImage && !imgFailed;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card">
        {article && (
          <article className="animate-in fade-in zoom-in-95 duration-300">
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              {loading && needsImage && !fetched?.image && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/60 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating relevant cover image…
                  </div>
                </div>
              )}
              <img
                src={showHeroImg ? heroImage : FALLBACK_IMAGE}
                alt={article.title}
                className="h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
              {void showHeroImg}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80 z-20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-sm bg-accent px-2 py-1 font-bold uppercase tracking-wider text-accent-foreground">
                  {article.category}
                </span>
                <span className="text-muted-foreground">{article.source}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">{article.title}</h1>
              <p className="text-sm text-muted-foreground">By {article.author}</p>

              <div className="prose prose-invert max-w-none text-base leading-relaxed text-foreground/90">
                {body.split(/\n+/).map((p, i) => (
                  <p key={i} className="mb-4">
                    {p}
                  </p>
                ))}
                {loading && !fetched?.content && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading full story…
                  </p>
                )}
              </div>

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
