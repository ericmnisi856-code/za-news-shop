import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/cnza/Navbar";
import { CartSheet } from "@/components/cnza/CartSheet";
import { StoreProvider, useStore, formatR } from "@/lib/cnza/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Lock } from "lucide-react";
import { CATEGORIES, type Category, type Product } from "@/lib/cnza/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · CNZA" }] }),
  component: () => (
    <StoreProvider>
      <AdminPage />
    </StoreProvider>
  ),
});

function AdminPage() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage e-book inventory and publish breaking news. Changes propagate live.</p>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6"><ProductsPanel /></TabsContent>
          <TabsContent value="news" className="mt-6"><NewsPanel /></TabsContent>
        </Tabs>
      </main>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}

function emptyProduct(): Omit<Product, "id"> {
  return { title: "", price: 0, description: "", category: "Politics", stock: 50, cover: "" };
}

function ProductsPanel() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct());

  const startEdit = (p: Product) => { setEditing(p.id); setForm({ ...p }); };
  const startNew = () => { setEditing("new"); setForm(emptyProduct()); };
  const save = () => {
    if (!form.title || form.price <= 0) { toast.error("Title and price required"); return; }
    if (editing === "new") { addProduct(form); toast.success("Product added"); }
    else if (editing) { updateProduct(editing, form); toast.success("Product updated"); }
    setEditing(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-serif text-lg font-semibold">Inventory ({products.length})</h2>
          <Button size="sm" onClick={startNew}><Plus className="mr-1 h-3 w-3" /> Add product</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-serif font-semibold">{p.title}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3">{formatR(p.price)}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${p.stock > 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>{p.stock > 0 ? `${p.stock} in stock` : "Out"}</span></td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { deleteProduct(p.id); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 font-serif text-lg font-semibold">{editing === "new" ? "New product" : editing ? "Edit product" : "Product editor"}</h3>
        {!editing ? (
          <p className="text-sm text-muted-foreground">Select a product to edit or add a new one.</p>
        ) : (
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price (R)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Cover image URL</Label><Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} placeholder="https://…" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={save}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function NewsPanel() {
  const { customArticles, addArticle, deleteArticle } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("Politics");
  const [image, setImage] = useState("");

  const publish = () => {
    if (!title || !content) { toast.error("Title and content required"); return; }
    addArticle({ title, content, category, image });
    setTitle(""); setContent(""); setImage("");
    toast.success("Article published live");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-serif text-lg font-semibold">Published articles ({customArticles.length})</h2>
        </div>
        <ul className="divide-y divide-border">
          {customArticles.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No custom articles yet.</li>}
          {customArticles.map((a) => (
            <li key={a.id} className="flex items-start gap-3 p-4">
              {a.image && <img src={a.image} alt="" className="h-16 w-24 rounded object-cover" />}
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-accent">{a.category}</div>
                <div className="font-serif font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">By {a.author} · {new Date(a.publishedAt).toLocaleString()}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteArticle(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 font-serif text-lg font-semibold">New article</h3>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Image URL</Label><Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" /></div>
          <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} /></div>
          <div>
            <Label>Author</Label>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="font-semibold">CityNewsZA</span>
              <span className="ml-auto text-xs text-muted-foreground">Locked</span>
            </div>
          </div>
          <Button className="w-full" onClick={publish}>Publish to feed</Button>
        </div>
      </aside>
    </div>
  );
}
