"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Status = "online" | "offline";

/** Shape returned by the Python worker → Redis → /api/status */
interface ApiSite {
  name: string;
  url: string;
  status: string; // "Online" | "Offline"
  ping: string;   // "45ms" | "0ms"
}

/** Normalised shape used inside the UI */
interface Website {
  id: number;
  name: string;
  url: string;
  status: Status;
  ping: number; // ms as a plain number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalise(raw: ApiSite, idx: number): Website {
  return {
    id: idx + 1,
    name: raw.name,
    url: raw.url,
    status: raw.status.toLowerCase() === "online" ? "online" : "offline",
    ping: parseInt(raw.ping, 10) || 0,
  };
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PingBar({ ping }: { ping: number }) {
  const max = 150;
  const pct = ping === 0 ? 0 : Math.min((ping / max) * 100, 100);
  const color =
    ping === 0
      ? "bg-red-500"
      : ping < 50
        ? "bg-emerald-400"
        : ping < 100
          ? "bg-yellow-400"
          : "bg-orange-400";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-12 text-right">
        {ping === 0 ? "—" : `${ping}ms`}
      </span>
    </div>
  );
}

/** Skeleton placeholder row shown while loading */
function SkeletonRow() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-[2fr_2fr_1.2fr_2fr_1fr_1fr] gap-4 items-center px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/10" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-2 w-12 rounded bg-white/5" />
        </div>
      </div>
      <div className="h-3 w-40 rounded bg-white/10" />
      <div className="h-6 w-20 rounded-full bg-white/10" />
      <div className="h-1.5 rounded-full bg-white/10" />
      <div className="h-3 w-12 rounded bg-white/10" />
      <div className="h-3 w-16 rounded bg-white/10" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [sites, setSites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0); // forces "X ago" label to refresh
  const [filter, setFilter] = useState<"all" | Status>("all");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiSite[] = await res.json();
      // API might return an error object instead of an array (e.g. Redis down)
      if (!Array.isArray(json)) throw new Error("Unexpected API response");
      setSites(json.map(normalise));
      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + 5-second polling
  useEffect(() => {
    fetchStatus();
    const pollId = setInterval(fetchStatus, 5_000);
    return () => clearInterval(pollId);
  }, [fetchStatus]);

  // Refresh the "X ago" label every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1_000);
    return () => clearInterval(id);
  }, []);

  // ── Derived counters ───────────────────────────────────────────────────────

  const totalWebsites = sites.length;
  const onlineCount = sites.filter((s) => s.status === "online").length;
  const offlineCount = sites.filter((s) => s.status === "offline").length;

  const filtered =
    filter === "all" ? sites : sites.filter((s) => s.status === filter);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#080c18] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Ambient glow blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span className="absolute inset-0 rounded-xl ring-2 ring-cyan-400/40 animate-ping" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                PingMe
              </h1>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-500">
                DevOps Monitor
              </p>
            </div>
          </div>

          {/* Live indicator — shows real last-updated time */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? "bg-red-400" : "bg-emerald-400"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? "bg-red-500" : "bg-emerald-500"}`} />
            </span>
            {error
              ? `Error: ${error}`
              : loading
                ? "Connecting…"
                : `Live · polls every 5s · ${lastUpdated ? timeAgo(lastUpdated) : "—"}`
            }
            {/* invisible dep to cause re-render each second */}
            <span className="hidden">{tick}</span>
          </div>
        </header>

        {/* ── Summary Cards ── */}
        <section aria-labelledby="summary-heading" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <h2 id="summary-heading" className="sr-only">Summary</h2>

          {/* Total */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/[0.08] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Total Websites</p>
            <p className="text-5xl font-black text-slate-100">
              {loading ? <span className="inline-block w-10 h-12 rounded-lg bg-white/10 animate-pulse" /> : totalWebsites}
            </p>
            <p className="mt-2 text-xs text-slate-500">Actively monitored</p>
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-blue-400">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>

          {/* Online */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/[0.08] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Online</p>
            <p className="text-5xl font-black text-emerald-400">
              {loading ? <span className="inline-block w-10 h-12 rounded-lg bg-white/10 animate-pulse" /> : onlineCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">Healthy &amp; responding</p>
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-emerald-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
              </svg>
            </div>
          </div>

          {/* Offline */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/[0.08] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Offline</p>
            <p className="text-5xl font-black text-red-400">
              {loading ? <span className="inline-block w-10 h-12 rounded-lg bg-white/10 animate-pulse" /> : offlineCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">Needs attention</p>
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-red-400">
                <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
              </svg>
            </div>
          </div>
        </section>

        {/* ── Monitored Websites ── */}
        <section aria-labelledby="sites-heading">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <h2 id="sites-heading" className="text-lg font-bold text-slate-200 tracking-tight">
              Monitored Websites
            </h2>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              {(["all", "online", "offline"] as const).map((tab) => (
                <button
                  key={tab}
                  id={`filter-${tab}`}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide capitalize transition-all ${filter === tab
                      ? "bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  {tab === "all" ? "All" : tab === "online" ? "🟢 Online" : "🔴 Offline"}
                </button>
              ))}
            </div>
          </div>

          {/* Table column headers */}
          <div className="hidden md:grid grid-cols-[2fr_2fr_1.2fr_2fr_1fr] gap-4 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-1">
            <span>Website</span>
            <span>URL</span>
            <span>Status</span>
            <span>Ping Latency</span>
            <span>Last Seen</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-3">
            {/* Loading skeletons */}
            {loading && [0, 1, 2].map((i) => <SkeletonRow key={i} />)}

            {/* Error banner (only when no data at all) */}
            {!loading && error && sites.length === 0 && (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-sm text-red-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0 text-red-400">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                </svg>
                <span>
                  Could not reach <code className="font-mono text-xs">/api/status</code> — make sure Redis and the worker are running.
                  <button onClick={fetchStatus} className="ml-3 underline text-red-400 hover:text-red-200 transition-colors">
                    Retry
                  </button>
                </span>
              </div>
            )}

            {/* Stale data + error notice */}
            {!loading && error && sites.length > 0 && (
              <div className="text-xs text-amber-400 px-2 mb-1">
                ⚠ Could not refresh — showing last known data.
              </div>
            )}

            {/* Data rows */}
            {!loading && filtered.map((site) => (
              <div
                key={site.id}
                id={`site-row-${site.id}`}
                className={`group relative grid grid-cols-1 md:grid-cols-[2fr_2fr_1.2fr_2fr_1fr] gap-4 items-center px-5 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${site.status === "online"
                    ? "bg-white/[0.04] border-white/10 hover:border-emerald-500/30 hover:shadow-emerald-500/10"
                    : "bg-red-950/10 border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10"
                  }`}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${site.status === "online" ? "bg-emerald-500" : "bg-red-500"}`} />

                {/* Name + initial avatar */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${site.status === "online" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                    }`}>
                    {site.name.charAt(0)}
                  </div>
                  <p className="font-semibold text-slate-100 text-sm">{site.name}</p>
                </div>

                {/* URL */}
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 truncate hover:text-cyan-400 transition-colors font-mono"
                >
                  {site.url}
                </a>

                {/* Status badge */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${site.status === "online"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/15 text-red-300 border border-red-500/30"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${site.status === "online"
                        ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                        : "bg-red-400 shadow-[0_0_6px_#f87171]"
                      }`} />
                    {site.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>

                {/* Ping bar */}
                <PingBar ping={site.ping} />

                {/* Last checked */}
                <span className="text-xs font-mono text-slate-500">
                  {lastUpdated ? timeAgo(lastUpdated) : "—"}
                </span>
              </div>
            ))}

            {/* Empty state after filter */}
            {!loading && !error && filtered.length === 0 && sites.length > 0 && (
              <div className="text-center py-16 text-slate-600 text-sm">
                No websites match this filter.
              </div>
            )}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            © 2026 <span className="text-cyan-600 font-semibold">PingMe</span> — DevOps Monitor
          </span>
          <span>Polls every 5 seconds · {totalWebsites} endpoint{totalWebsites !== 1 ? "s" : ""} active</span>
        </footer>
      </div>
    </div>
  );
}



