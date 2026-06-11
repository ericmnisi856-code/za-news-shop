import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatR, useStore } from "@/lib/cnza/store";
import { ArrowLeft, CheckCircle2, Download, CreditCard, Wallet } from "lucide-react";

interface Item { id: string; title: string; price: number; quantity: number }
interface Props { items: Item[]; subtotal: number; tax: number; total: number; onClose: () => void; onBack: () => void }

export function Checkout({ items, subtotal, tax, total, onClose, onBack }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"eft" | "payfast">("eft");
  const { clearCart } = useStore();

  const downloadPdf = (title: string) => {
    // Minimal valid PDF
    const text = `CityNewsZA E-Book: ${title}`;
    const pdf = `%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>>>endobj\n4 0 obj<</Length ${text.length + 60}>>stream\nBT /F1 18 Tf 72 720 Td (${text}) Tj ET\nendstream endobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000098 00000 n \n0000000200 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n300\n%%EOF`;
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title.replace(/[^a-z0-9]+/gi, "-")}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        {step !== 3 && (
          <button onClick={step === 1 ? onBack : () => setStep((s) => (s - 1) as 1 | 2)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <h3 className="font-serif text-lg font-semibold">
          {step === 1 && "Customer details"}
          {step === 2 && "Payment"}
          {step === 3 && "Order complete"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Thandi Mokoena" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.co.za" />
            </div>
            <p className="text-xs text-muted-foreground">Digital delivery — your e-books will be available to download instantly after payment.</p>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <button onClick={() => setMethod("eft")} className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${method === "eft" ? "border-accent bg-accent/5" : "border-border"}`}>
              <Wallet className="h-5 w-5" />
              <div className="flex-1">
                <div className="font-semibold">Instant EFT</div>
                <div className="text-xs text-muted-foreground">Pay directly from your South African bank account</div>
              </div>
            </button>
            <button onClick={() => setMethod("payfast")} className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${method === "payfast" ? "border-accent bg-accent/5" : "border-border"}`}>
              <CreditCard className="h-5 w-5" />
              <div className="flex-1">
                <div className="font-semibold">PayFast</div>
                <div className="text-xs text-muted-foreground">Card, SnapScan, Zapper & more</div>
              </div>
            </button>
            <p className="pt-2 text-xs text-muted-foreground">This is a simulated checkout. No real payment is processed.</p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-accent" />
              <h4 className="font-serif text-xl font-bold">Thank you, {name || "reader"}!</h4>
              <p className="text-sm text-muted-foreground">Your order is confirmed. Download your e-books below.</p>
            </div>
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="font-serif font-semibold">{i.title}</div>
                    <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadPdf(i.title)}>
                    <Download className="mr-1 h-3 w-3" /> PDF
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 space-y-2">
        {step !== 3 && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>{formatR(subtotal)}</span></div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>VAT</span><span>{formatR(tax)}</span></div>
            <div className="flex justify-between font-serif text-base font-bold"><span>Total</span><span>{formatR(total)}</span></div>
          </>
        )}
        {step === 1 && (
          <Button className="w-full" size="lg" disabled={!name || !email} onClick={() => setStep(2)}>Continue to payment</Button>
        )}
        {step === 2 && (
          <Button className="w-full" size="lg" onClick={() => { setStep(3); clearCart(); }}>Pay {formatR(total)}</Button>
        )}
        {step === 3 && (
          <Button className="w-full" size="lg" variant="outline" onClick={onClose}>Done</Button>
        )}
      </div>
    </div>
  );
}
