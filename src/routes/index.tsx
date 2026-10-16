import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/cnza/Navbar";
import { HeroCarousel } from "@/components/cnza/HeroCarousel";
import { VoteBanner } from "@/components/cnza/VoteBanner";
import { ShopStrip } from "@/components/cnza/ShopStrip";
import { CartSheet } from "@/components/cnza/CartSheet";
import { ArticleReader } from "@/components/cnza/ArticleReader";
import { InfiniteNewsGrid } from "@/components/cnza/InfiniteNewsGrid";
import { StoreProvider, useStore } from "@/lib/cnza/store";
import { fetchNews } from "@/lib/cnza/rss.functions";
import { CATEGORIES, type Category, type NewsArticle } from "@/lib/cnza/types";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "City News ZA (CNZA) — South African News & E-Book Store" },
      { name: "description", content: "Live South African news from Daily Maverick, News24, SuperSport, MyBroadband, Moneyweb and more — plus a curated bookstore." },
      { property: "og:title", content: "City News ZA (CNZA)" },
      { property: "og:description", content: "South African news aggregator and digital bookstore." },
    ],
  }),
  component: () => (
    <StoreProvider>
      <Home />
    </StoreProvider>
  ),
});

function Home() {
  const [active, setActive] = useState<string>("Headline");
  const [cartOpen, setCartOpen] = useState(false);
  const [reading, setReading] = useState<NewsArticle | null>(null);
  const { customArticles } = useStore();

  // Always start from the top on initial mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Scroll to top when switching categories
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [active]);

  const cat = active === "Headline" ? undefined : (active as Category);

  const { data, isLoading } = useQuery({
    queryKey: ["news", cat ?? "all"],
    queryFn: () => fetchNews({ data: cat ? { category: cat } : {} }),
    staleTime: 5 * 60_000,
  });

  const articles = useMemo(() => {
    const remote = data ?? [];
    const custom = cat ? customArticles.filter((a) => a.category === cat) : customArticles;
    return [...custom, ...remote];
  }, [data, customArticles, cat]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeCategory={active} onCategoryChange={setActive} onCartOpen={() => setCartOpen(true)} />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-6">
        {active === "Headline" && (
          <>
            <VoteBanner />
            {isLoading && articles.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <HeroCarousel articles={articles} onOpen={setReading} />
            )}
          </>
        )}

        <section>
          <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="font-serif text-2xl font-bold">{active === "Headline" ? "Latest across South Africa" : active}</h2>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {isLoading ? "Loading…" : `${articles.length} stories`}
            </span>
          </div>

          {isLoading && articles.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <InfiniteNewsGrid articles={articles} onOpen={setReading} />
          )}
        </section>

        <ShopStrip category={active} />

        {active === "Headline" && (
          <section className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="font-serif text-2xl font-bold">Browse by section</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className="rounded-lg border border-border bg-card p-6 text-left transition hover:border-accent hover:shadow-md"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-accent">Section</div>
                  <div className="mt-1 font-serif text-xl font-bold">{c}</div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border bg-card py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground lg:px-6">
          © {new Date().getFullYear()} City News ZA · Aggregated headlines link to original publishers · Editorial by CityNewsZA
        </div>
      </footer>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      <ArticleReader article={reading} onClose={() => setReading(null)} />
    </div>
  );
}
