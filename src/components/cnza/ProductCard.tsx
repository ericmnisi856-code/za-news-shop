import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, formatR } from "@/lib/cnza/store";
import type { Product } from "@/lib/cnza/types";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img src={product.cover} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{product.category} · E-Book</span>
        <h3 className="font-serif text-base font-semibold leading-snug">{product.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-serif text-xl font-bold">{formatR(product.price)}</span>
          <Button size="sm" onClick={() => { addToCart(product.id); toast.success("Added to cart"); }}>
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
