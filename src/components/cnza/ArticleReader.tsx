import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { NewsArticle } from "@/lib/cnza/types";
import { Loader2, X, Facebook, Twitter, Linkedin, Link2, MessageCircle, Mail, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/cnza/fallbackImage";

const SITE_URL = "https://citynewsza.co.za";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

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

              <ShareBar article={article} body={body} />
            </div>
          </article>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShareBar({ article, body }: { article: NewsArticle; body: string }) {
  const slug = slugify(article.title);
  const excerpt = (article.excerpt || body || "").replace(/\s+/g, " ").slice(0, 220);
  const params = new URLSearchParams({
    t: article.title,
    d: excerpt,
    src: article.source,
    cat: article.category,
  });
  if (article.image) params.set("img", article.image);
  if (article.link && article.link !== "#") params.set("url", article.link);
  const url = `${SITE_URL}/article/${slug}?${params.toString()}`;
  const title = article.title;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, url });
      } catch {}
    }
  };

  const btn = "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-muted";

  return (
    <div className="border-t border-border pt-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share this article</div>
      <div className="flex flex-wrap items-center gap-2">
        <a className={btn} aria-label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
        <a className={btn} aria-label="Share on X/Twitter" href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
        <a className={btn} aria-label="Share on LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4" />
        </a>
        <a className={btn} aria-label="Share on WhatsApp" href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
        </a>
        <a className={btn} aria-label="Share via Email" href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>
          <Mail className="h-4 w-4" />
        </a>
        <button type="button" onClick={copy} className={btn} aria-label="Copy link">
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Link2 className="h-4 w-4" />}
        </button>
        {typeof navigator !== "undefined" && (navigator as any).share && (
          <button type="button" onClick={nativeShare} className="ml-1 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-semibold hover:bg-muted">
            Share…
          </button>
        )}
      </div>
    </div>
  );
}
