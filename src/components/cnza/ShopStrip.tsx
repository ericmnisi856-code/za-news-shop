import { useStore } from "@/lib/cnza/store";
import { ProductCard } from "./ProductCard";

export function ShopStrip({ category }: { category?: string }) {
  const { products } = useStore();
  const list = category && category !== "Headline" ? products.filter((p) => p.category === category) : products;
  if (list.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <h2 className="font-serif text-2xl font-bold">CNZA Bookstore</h2>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Curated e-books · Instant download</span>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
