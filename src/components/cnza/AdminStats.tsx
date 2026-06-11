import { useEffect, useState } from "react";
import { computeStats, loadVisits, clearVisits, type Stats } from "@/lib/cnza/analytics";
import { Button } from "@/components/ui/button";
import { Eye, Users, Clock, Activity, Trash2, RotateCw } from "lucide-react";

function useStats(): Stats {
  const [stats, setStats] = useState<Stats>(() => computeStats(loadVisits()));
  useEffect(() => {
    const refresh = () => setStats(computeStats(loadVisits()));
    window.addEventListener("cnza:visits", refresh);
    window.addEventListener("storage", refresh);
    const t = setInterval(refresh, 15_000);
    return () => {
      window.removeEventListener("cnza:visits", refresh);
      window.removeEventListener("storage", refresh);
      clearInterval(t);
    };
  }, []);
  return stats;
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-serif text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function AdminStats() {
  const stats = useStats();
  const max7 = Math.max(1, ...stats.last7Days.map((d) => d.count));
  const max24 = Math.max(1, ...stats.hourly24.map((h) => h.count));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">Visitor analytics</h2>
          <p className="text-sm text-muted-foreground">
            Anonymous, on-device tracking of page views. Admin browsing is excluded from these counts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new CustomEvent("cnza:visits"))} className="gap-2">
            <RotateCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={clearVisits} className="gap-2 text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Eye className="h-3.5 w-3.5" />} label="Total page views" value={stats.totalVisits} />
        <StatCard icon={<Users className="h-3.5 w-3.5" />} label="Unique visitors" value={stats.uniqueVisitors} />
        <StatCard icon={<Activity className="h-3.5 w-3.5" />} label="Sessions" value={stats.sessions} />
        <StatCard icon={<Clock className="h-3.5 w-3.5" />} label="Views today" value={stats.todayVisits} hint={new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 font-serif text-lg font-semibold">Last 7 days</h3>
          <div className="flex h-44 items-end gap-3">
            {stats.last7Days.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-[10px] font-semibold text-muted-foreground">{d.count}</div>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-accent transition-all"
                  style={{ height: `${(d.count / max7) * 100}%`, minHeight: d.count > 0 ? 4 : 2 }}
                  title={`${d.date}: ${d.count}`}
                />
                <div className="text-xs text-muted-foreground">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 font-serif text-lg font-semibold">Last 24 hours (by hour)</h3>
          <div className="flex h-44 items-end gap-[3px]">
            {stats.hourly24.map((h) => (
              <div key={h.hour} className="flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-t bg-accent/70 transition-all hover:bg-accent"
                  style={{ height: `${(h.count / max24) * 100}%`, minHeight: h.count > 0 ? 3 : 1 }}
                  title={`${h.hour}:00 — ${h.count} views`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-serif text-lg font-semibold">Top pages</h3>
          {stats.topPaths.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topPaths.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-mono text-xs">{p.path}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-serif text-lg font-semibold">Top referrers</h3>
          {stats.topReferrers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Most visitors arrived directly.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topReferrers.map((r) => (
                <li key={r.ref} className="flex items-center justify-between text-sm">
                  <span className="truncate">{r.ref}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-serif text-lg font-semibold">Recent visits</h3>
        </div>
        {stats.recent.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No visits tracked yet. Open the home page in another tab to record one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">When</th>
                  <th className="p-3">Page</th>
                  <th className="p-3">Visitor</th>
                  <th className="p-3">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((v, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3 text-muted-foreground">{new Date(v.t).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="p-3 font-mono text-xs">{v.path}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{v.v.slice(0, 6)}</td>
                    <td className="p-3 text-muted-foreground">{v.ref ?? "Direct"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
