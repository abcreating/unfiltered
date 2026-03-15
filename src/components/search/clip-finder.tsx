"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipResult, type ClipResultData } from "@/components/search/clip-result";
import { Search, Loader2 } from "lucide-react";

// Shape returned by the /api/search/clip endpoint
type ApiClipResult = {
  paragraphId: string;
  speechId: string;
  speechSlug: string;
  speechTitle: string;
  deliveredAt: string;
  leaderName: string;
  leaderSlug: string;
  matchedParagraph: {
    id: string;
    index: number;
    text: string;
    startTime: number | null;
    endTime: number | null;
    speakerLabel: string | null;
  };
  context: {
    id: string;
    index: number;
    text: string;
    startTime: number | null;
    endTime: number | null;
    speakerLabel: string | null;
  }[];
};

function transformApiResult(
  item: ApiClipResult,
  searchQuery: string
): ClipResultData {
  const matchedIndex = item.matchedParagraph.index;
  const contextBefore = item.context
    .filter((p) => p.index < matchedIndex)
    .sort((a, b) => a.index - b.index)
    .map((p) => ({ index: p.index, text: p.text }));
  const contextAfter = item.context
    .filter((p) => p.index > matchedIndex)
    .sort((a, b) => a.index - b.index)
    .map((p) => ({ index: p.index, text: p.text }));

  return {
    paragraphId: item.paragraphId,
    speechId: item.speechId,
    speechSlug: item.speechSlug,
    speechTitle: item.speechTitle,
    leaderName: item.leaderName,
    leaderSlug: item.leaderSlug,
    deliveredAt: item.deliveredAt,
    matchedIndex,
    matchedText: item.matchedParagraph.text,
    query: searchQuery,
    contextBefore,
    contextAfter,
    startTime: item.matchedParagraph.startTime,
  };
}

export function ClipFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClipResultData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmed = query.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const res = await fetch("/api/search/clip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? `Search failed (${res.status})`
          );
        }

        const data = await res.json();
        const transformed = (data.data ?? []).map((item: ApiClipResult) =>
          transformApiResult(item, trimmed)
        );
        setResults(transformed);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [query]
  );

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Paste a quote here, e.g. "We will not allow any nation to..."'
            className="min-h-[120px] text-base leading-relaxed resize-y pr-4"
            rows={4}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !query.trim()}
            className="gap-2 px-6"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Find Context
          </Button>
          {query.trim() && !isLoading && (
            <span className="text-xs text-muted-foreground">
              {query.trim().split(/\s+/).length} words
            </span>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mt-10 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-border/60 rounded-lg overflow-hidden"
            >
              <div className="px-5 py-4 bg-card border-b border-border/40 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <div className="px-5 py-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && results !== null && (
        <div className="mt-10">
          {results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Found {results.length} matching{" "}
                {results.length === 1 ? "passage" : "passages"}
              </p>
              <div className="space-y-6">
                {results.map((result) => (
                  <ClipResult key={result.paragraphId} result={result} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No matching transcripts found. Try a shorter or different
                phrase.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial state hint */}
      {!hasSearched && !isLoading && (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Paste a quote you saw in the news, on social media, or anywhere
            else. We will search our archive of full transcripts and show you
            what was said before and after.
          </p>
        </div>
      )}
    </div>
  );
}
