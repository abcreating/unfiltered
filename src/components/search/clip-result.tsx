"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Share2 } from "lucide-react";

export type ClipResultData = {
  paragraphId: string;
  speechId: string;
  speechSlug: string;
  speechTitle: string;
  leaderName: string;
  leaderSlug: string;
  deliveredAt: string;
  /** Index of the matched paragraph within the speech */
  matchedIndex: number;
  /** The matched paragraph text */
  matchedText: string;
  /** The query string to highlight within the matched text */
  query: string;
  /** Surrounding paragraphs for context (2 before + 2 after) */
  contextBefore: { index: number; text: string }[];
  contextAfter: { index: number; text: string }[];
  /** Timestamp of the matched paragraph, if available */
  startTime: number | null;
};

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  // Escape special regex chars in query
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-amber-200/80 text-foreground px-0.5 -mx-0.5 rounded-sm"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function ClipResult({ result }: { result: ClipResultData }) {
  return (
    <article className="border border-border/60 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border/40">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/speeches/${result.speechSlug}`}
              className="heading-serif text-lg text-foreground hover:text-[#d97706] transition-colors"
            >
              {result.speechTitle}
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              <Link
                href={`/leaders/${result.leaderSlug}`}
                className="link-accent"
              >
                {result.leaderName}
              </Link>
              <span className="mx-2 text-border">|</span>
              {formatDate(result.deliveredAt)}
            </p>
          </div>
          {result.startTime !== null && (
            <Badge variant="outline" className="shrink-0 font-mono text-xs">
              {formatTimestamp(result.startTime)}
            </Badge>
          )}
        </div>
      </div>

      {/* Context paragraphs */}
      <div className="px-5 py-4 transcript-body">
        {/* Before context */}
        {result.contextBefore.map((p) => (
          <p
            key={p.index}
            className="transcript-paragraph text-foreground/50"
          >
            {p.text}
          </p>
        ))}

        {/* Matched paragraph */}
        <div className="relative my-2">
          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-amber-500 rounded-full" />
          <p className="transcript-paragraph text-foreground pl-2 !mb-2">
            {highlightMatch(result.matchedText, result.query)}
          </p>
        </div>

        {/* After context */}
        {result.contextAfter.map((p) => (
          <p
            key={p.index}
            className="transcript-paragraph text-foreground/50"
          >
            {p.text}
          </p>
        ))}
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border-border/40 bg-card/50 flex items-center justify-between">
        <Link
          href={`/speeches/${result.speechSlug}`}
          className="text-sm link-accent inline-flex items-center gap-1.5"
        >
          <ExternalLink className="size-3.5" />
          Read full speech
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Placeholder: share functionality
          }}
          className="text-muted-foreground"
        >
          <Share2 className="size-3.5" />
          Share context
        </Button>
      </div>
    </article>
  );
}
