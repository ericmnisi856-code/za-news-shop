import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAdmin } from "@/lib/cnza/auth";
import { Newspaper, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Login · CNZA" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (signInAdmin(email, password)) {
      toast.success("Welcome back, admin");
      nav({ to: "/admin" });
    } else {
      toast.error("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card/95 p-8 shadow-2xl backdrop-blur">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "var(--gradient-primary)" }}>
            <Newspaper className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-serif text-xl font-bold">City News ZA</div>
            <div className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin Portal</div>
          </div>
        </Link>
        <h1 className="font-serif text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Authorised personnel only.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Lock className="h-4 w-4" /> {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
