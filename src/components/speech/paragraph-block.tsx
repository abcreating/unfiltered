"use client";

import { useRef, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParagraphBlockProps {
  index: number;
  text: string;
  startTime: number | null;
  endTime: number | null;
  speakerLabel: string | null;
  isActive: boolean;
  highlightText?: string;
  speechSlug?: string;
  onParagraphClick: (index: number) => void;
}

function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function highlightMatches(text: string, query: string): ReactNode {
  if (!query || query.trim().length === 0) {
    return text;
  }

  // Escape regex special characters in the query
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, i) => {
    if (regex.test(part)) {
      // Reset lastIndex since we're reusing the regex
      regex.lastIndex = 0;
      return (
        <mark key={i} className="transcript-highlight">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function ParagraphBlock({
  index,
  text,
  startTime,
  endTime,
  speakerLabel,
  isActive,
  highlightText,
  speechSlug,
  onParagraphClick,
}: ParagraphBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}/speeches/${speechSlug}#p${index + 1}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    },
    [speechSlug, index]
  );

  // Scroll into view when this paragraph becomes active
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isActive]);

  const renderedText = useMemo(() => {
    return highlightText ? highlightMatches(text, highlightText) : text;
  }, [text, highlightText]);

  return (
    <div
      ref={ref}
      id={`p${index + 1}`}
      className={cn(
        "transcript-paragraph group relative flex gap-6 py-3 -mx-4 px-4 rounded-sm transition-colors duration-200",
        isActive && "bg-amber-50/80 dark:bg-amber-950/20",
        startTime !== null && "cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800/30"
      )}
      onClick={() => onParagraphClick(index)}
      role={startTime !== null ? "button" : undefined}
      tabIndex={startTime !== null ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onParagraphClick(index);
        }
      }}
    >
      {/* Paragraph number in margin */}
      <div className="shrink-0 w-8 pt-0.5 select-none">
        <span className="text-xs tabular-nums text-muted-foreground/40 font-mono">
          {index + 1}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Speaker label */}
        {speakerLabel && (
          <div className="transcript-speaker">{speakerLabel}</div>
        )}

        {/* Timestamp badge */}
        {startTime !== null && (
          <span className="transcript-timestamp inline-block mb-1.5 mr-2">
            {formatTimestamp(startTime)}
            {endTime !== null && ` \u2013 ${formatTimestamp(endTime)}`}
          </span>
        )}

        {/* Paragraph text */}
        <p className="text-foreground/90">{renderedText}</p>
      </div>

      {/* Copy link button */}
      {speechSlug && (
        <button
          onClick={handleCopyLink}
          className="shrink-0 self-start mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-foreground"
          title="Copy link to paragraph"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Link2 className="size-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
