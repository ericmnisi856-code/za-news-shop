import { useEffect, useState } from "react";
import type { NewsArticle } from "@/lib/cnza/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroCarousel({ articles, onOpen }: { articles: NewsArticle[]; onOpen: (a: NewsArticle) => void }) {
  const top = articles.slice(0, 5);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (top.length <= 1) return;
    const t = setInterval(() => setI((x) => (x + 1) % top.length), 6000);
    return () => clearInterval(t);
  }, [top.length]);
  if (top.length === 0) return null;
  const a = top[i];
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(a.id)}/1200/750`;
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[16/10] md:aspect-auto md:h-full bg-muted">
          <img key={a.id} src={a.image || fallback} alt={a.title} onError={(e) => { const img = e.currentTarget as HTMLImageElement; if (img.src !== fallback) img.src = fallback; }} className="h-full w-full object-cover animate-in fade-in duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-sm bg-accent px-2 py-1 font-bold uppercase tracking-wider text-accent-foreground">Top story</span>
            <span className="text-muted-foreground">{a.category} · {a.source}</span>
          </div>
          <h2 className="font-serif text-2xl font-bold leading-tight md:text-4xl">{a.title}</h2>
          <p className="text-sm text-muted-foreground md:text-base line-clamp-3">{a.excerpt}</p>
          <div className="flex items-center gap-3">
            {a.link && a.link !== "#" ? (
              <a href={a.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Read full story
              </a>
            ) : (
              <span className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">CNZA Exclusive</span>
            )}
            <span className="text-xs text-muted-foreground">By {a.author}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => setI((x) => (x - 1 + top.length) % top.length)} className="rounded-full border border-border p-1.5 hover:bg-muted" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
            <div className="flex gap-1">
              {top.map((_, k) => (
                <button key={k} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-accent" : "w-2 bg-border"}`} aria-label={`Slide ${k + 1}`} />
              ))}
            </div>
            <button onClick={() => setI((x) => (x + 1) % top.length)} className="rounded-full border border-border p-1.5 hover:bg-muted" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
