import { useEffect, useRef, useState } from "react";
import { NewsCard } from "./NewsCard";
import type { NewsArticle } from "@/lib/cnza/types";
import { Loader2 } from "lucide-react";

interface Props {
  articles: NewsArticle[];
  onOpen: (a: NewsArticle) => void;
  pageSize?: number;
}

function Row({ article, index, onOpen }: { article: NewsArticle; index: number; onOpen: (a: NewsArticle) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "80px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const progress = 1 - (rect.top + rect.height / 2) / vh; // -1..1-ish
        setOffset(Math.max(-20, Math.min(20, progress * 14)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const delay = (index % 6) * 60;
  return (
    <div
      ref={ref}
      style={{
        transform: visible ? `translate3d(0, ${-offset}px, 0)` : "translate3d(0, 32px, 0)",
        opacity: visible ? 1 : 0,
        transition: `opacity 600ms ease ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      <NewsCard article={article} onOpen={onOpen} />
    </div>
  );
}

export function InfiniteNewsGrid({ articles, onOpen, pageSize = 9 }: Props) {
  const [count, setCount] = useState(pageSize);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(pageSize);
  }, [articles, pageSize]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setCount((c) => Math.min(c + pageSize, articles.length));
        }
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [articles.length, pageSize]);

  const visible = articles.slice(0, count);
  const hasMore = count < articles.length;

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a, i) => (
          <Row key={a.id} article={a} index={i} onOpen={onOpen} />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinel} className="mt-8 flex h-20 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more stories…
        </div>
      )}
      {!hasMore && articles.length > pageSize && (
        <div className="mt-8 text-center text-xs uppercase tracking-widest text-muted-foreground">— End of feed —</div>
      )}
    </div>
  );
}
