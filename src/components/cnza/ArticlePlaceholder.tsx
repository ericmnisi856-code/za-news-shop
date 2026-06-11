import type { Category } from "@/lib/cnza/types";

const categoryStyles: Record<string, { from: string; to: string; emoji: string }> = {
  Politics: { from: "from-emerald-900", to: "to-emerald-600", emoji: "⚖️" },
  Sports: { from: "from-orange-900", to: "to-amber-500", emoji: "🏉" },
  Technology: { from: "from-sky-900", to: "to-cyan-500", emoji: "⚡" },
  Business: { from: "from-yellow-900", to: "to-yellow-500", emoji: "📈" },
  Leisure: { from: "from-fuchsia-900", to: "to-pink-500", emoji: "🎭" },
};

interface Props {
  title: string;
  category: Category | string;
  className?: string;
  large?: boolean;
}

export function ArticlePlaceholder({ title, category, className = "", large = false }: Props) {
  const s = categoryStyles[category] ?? { from: "from-zinc-900", to: "to-zinc-700", emoji: "📰" };
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between bg-gradient-to-br ${s.from} ${s.to} p-5 text-white ${className}`}
      role="img"
      aria-label={`${category} article: ${title}`}
    >
      <div className="flex items-start justify-between">
        <span className="rounded-sm bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
          {category}
        </span>
        <span className={large ? "text-5xl" : "text-3xl"} aria-hidden>
          {s.emoji}
        </span>
      </div>
      <div className={`font-serif font-bold leading-tight drop-shadow ${large ? "text-3xl md:text-4xl" : "text-lg"}`}>
        {title.length > (large ? 140 : 90) ? `${title.slice(0, large ? 140 : 90)}…` : title}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">CityNewsZA</div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
    </div>
  );
}
