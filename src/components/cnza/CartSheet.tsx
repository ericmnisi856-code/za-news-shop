import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useStore, formatR } from "@/lib/cnza/store";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Checkout } from "./Checkout";

export function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { cart, products, updateQty, removeFromCart } = useStore();
  const [checkout, setCheckout] = useState(false);

  const items = useMemo(() => cart.map((c) => {
    const p = products.find((x) => x.id === c.productId);
    return p ? { ...p, quantity: c.quantity } : null;
  }).filter(Boolean) as Array<{ id: string; title: string; price: number; cover?: string; quantity: number }>, [cart, products]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 font-serif"><ShoppingBag className="h-4 w-4" /> Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {checkout ? (
          <Checkout items={items} total={total} subtotal={subtotal} tax={tax} onClose={() => { setCheckout(false); onOpenChange(false); }} onBack={() => setCheckout(false)} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 rounded-lg border border-border p-3">
                      <img src={i.cover} alt={i.title} className="h-20 w-16 rounded object-cover" />
                      <div className="flex flex-1 flex-col">
                        <div className="font-serif font-semibold leading-tight">{i.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">E-Book · Digital download</div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(i.id, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(i.id, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatR(i.price * i.quantity)}</span>
                            <button onClick={() => removeFromCart(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-2">
                <Row label="Subtotal" value={formatR(subtotal)} />
                <Row label="VAT (15%)" value={formatR(tax)} />
                <Row label="Shipping (digital)" value="R0.00" />
                <div className="my-2 h-px bg-border" />
                <Row label="Total" value={formatR(total)} bold />
                <Button className="mt-3 w-full" size="lg" onClick={() => setCheckout(true)}>Checkout</Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "text-base font-bold" : "text-muted-foreground"}`}>
      <span>{label}</span><span className={bold ? "font-serif" : ""}>{value}</span>
    </div>
  );
}
