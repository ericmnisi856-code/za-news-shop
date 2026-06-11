import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, LayoutDashboard, User, Newspaper, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/cnza/store";
import { CATEGORIES } from "@/lib/cnza/types";
import { useEffect, useState } from "react";

interface Props {
  activeCategory?: string;
  onCategoryChange?: (c: string) => void;
  onCartOpen: () => void;
}

export function Navbar({ activeCategory = "Headline", onCategoryChange, onCartOpen }: Props) {
  const { cart } = useStore();
  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("cnza_dark");
    const isDark = stored === null ? true : stored === "1";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggleDark = () => {
    const nx = !dark;
    setDark(nx);
    document.documentElement.classList.toggle("dark", nx);
    localStorage.setItem("cnza_dark", nx ? "1" : "0");
  };

  const tabs = ["Headline", ...CATEGORIES];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Newspaper className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold tracking-tight">City News ZA</div>
            <div className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">CNZA</div>
          </div>
        </Link>

        {onHome && (
          <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => onCategoryChange?.(t)}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                  activeCategory === t ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t}
                {activeCategory === t && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-accent" />
                )}
              </button>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onCartOpen} aria-label="Cart" className="relative">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Button>
          <Link to="/admin">
            <Button variant="ghost" size="icon" aria-label="Admin">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="ml-1 gap-2">
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
          </Button>
        </div>
      </div>

      {onHome && (
        <div className="overflow-x-auto border-t border-border lg:hidden">
          <div className="flex gap-1 px-2 py-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => onCategoryChange?.(t)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                  activeCategory === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
