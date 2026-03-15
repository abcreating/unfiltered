"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface IngestionLog {
  id: string;
  speechId: string | null;
  source: string;
  method: string;
  status: string;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

const SCRAPERS = [
  { value: "youtube", label: "YouTube" },
  { value: "whitehouse", label: "White House" },
  { value: "un", label: "United Nations" },
  { value: "gov-uk", label: "UK Government" },
  { value: "generic", label: "Generic (any URL)" },
];

export default function IngestionPage() {
  const [url, setUrl] = useState("");
  const [scraper, setScraper] = useState("generic");
  const [leaderSlug, setLeaderSlug] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<IngestionLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/ingestion-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      // ignore
    }
  }

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: url,
          scraper,
          leaderSlug: leaderSlug || undefined,
          title: title || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(`Success! Speech ID: ${data.speechId}`);
        setUrl("");
        setTitle("");
        setLeaderSlug("");
        fetchLogs();
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="heading-serif text-3xl text-foreground mb-8">
            Speech Ingestion
          </h1>

          {/* Ingestion Form */}
          <form onSubmit={handleIngest} className="border border-border p-6 mb-12">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
              Ingest New Speech
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Source URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Scraper
                  </label>
                  <select
                    value={scraper}
                    onChange={(e) => setScraper(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm"
                  >
                    {SCRAPERS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Leader Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={leaderSlug}
                    onChange={(e) => setLeaderSlug(e.target.value)}
                    placeholder="e.g. donald-trump"
                    className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title Override (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Leave blank to auto-detect"
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Ingesting..." : "Ingest Speech"}
              </button>

              {result && (
                <p
                  className={`text-sm mt-2 ${
                    result.startsWith("Error") ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {result}
                </p>
              )}
            </div>
          </form>

          {/* Ingestion Logs */}
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Recent Ingestion Logs
          </h2>

          <div className="border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-2 font-medium">Source</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Time</th>
                  <th className="text-left px-4 py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50">
                    <td className="px-4 py-2 truncate max-w-[200px]">
                      {log.source}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs ${
                          log.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : log.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(log.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-red-600 truncate max-w-[200px]">
                      {log.error || "—"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No ingestion logs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
