// Lightweight client-side analytics stored in localStorage.
// Tracks page views with timestamp, path, and an anonymous visitor id.

const VISITS_KEY = "cnza_visits";
const VISITOR_KEY = "cnza_visitor_id";
const SESSION_KEY = "cnza_session_id";
const MAX_VISITS = 2000;

export interface Visit {
  t: number;        // timestamp ms
  path: string;     // pathname
  v: string;        // visitor id
  s: string;        // session id
  ref?: string;     // referrer host
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uid();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uid();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function loadVisits(): Visit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VISITS_KEY);
    return raw ? (JSON.parse(raw) as Visit[]) : [];
  } catch {
    return [];
  }
}

function saveVisits(v: Visit[]) {
  try {
    localStorage.setItem(VISITS_KEY, JSON.stringify(v));
    window.dispatchEvent(new CustomEvent("cnza:visits"));
  } catch {
    /* ignore quota */
  }
}

let lastTrack = { path: "", t: 0 };

export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  // Skip admin pages from the public stats so admin browsing doesn't inflate counts
  if (path.startsWith("/admin")) return;
  const now = Date.now();
  // Debounce duplicate fires for the same path within 1s
  if (lastTrack.path === path && now - lastTrack.t < 1000) return;
  lastTrack = { path, t: now };

  const visits = loadVisits();
  let ref: string | undefined;
  try {
    ref = document.referrer ? new URL(document.referrer).hostname : undefined;
    if (ref === window.location.hostname) ref = undefined;
  } catch {
    ref = undefined;
  }
  visits.push({ t: now, path, v: getVisitorId(), s: getSessionId(), ref });
  if (visits.length > MAX_VISITS) visits.splice(0, visits.length - MAX_VISITS);
  saveVisits(visits);
}

export function clearVisits() {
  localStorage.removeItem(VISITS_KEY);
  window.dispatchEvent(new CustomEvent("cnza:visits"));
}

export interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  sessions: number;
  todayVisits: number;
  last7Days: { date: string; label: string; count: number }[];
  hourly24: { hour: number; count: number }[];
  topPaths: { path: string; count: number }[];
  topReferrers: { ref: string; count: number }[];
  recent: Visit[];
}

export function computeStats(visits: Visit[]): Stats {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const last7Days: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = visits.filter((v) => v.t >= d.getTime() && v.t < next.getTime()).length;
    last7Days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-ZA", { weekday: "short" }),
      count,
    });
  }

  const since24h = now.getTime() - 24 * 3600_000;
  const hourly24: { hour: number; count: number }[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  for (const v of visits) {
    if (v.t >= since24h) {
      const h = new Date(v.t).getHours();
      hourly24[h].count++;
    }
  }

  const pathCounts = new Map<string, number>();
  const refCounts = new Map<string, number>();
  const visitorSet = new Set<string>();
  const sessionSet = new Set<string>();
  for (const v of visits) {
    pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
    if (v.ref) refCounts.set(v.ref, (refCounts.get(v.ref) ?? 0) + 1);
    visitorSet.add(v.v);
    sessionSet.add(v.s);
  }

  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }));
  const topReferrers = [...refCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ref, count]) => ({ ref, count }));

  return {
    totalVisits: visits.length,
    uniqueVisitors: visitorSet.size,
    sessions: sessionSet.size,
    todayVisits: visits.filter((v) => v.t >= startOfToday.getTime()).length,
    last7Days,
    hourly24,
    topPaths,
    topReferrers,
    recent: [...visits].slice(-20).reverse(),
  };
}
