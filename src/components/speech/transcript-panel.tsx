"use client";

import { useRef, useEffect } from "react";
import { ParagraphBlock } from "./paragraph-block";
import { cn } from "@/lib/utils";

interface ParagraphData {
  id: string;
  index: number;
  text: string;
  startTime: number | null;
  endTime: number | null;
  speakerLabel: string | null;
}

interface TranscriptPanelProps {
  paragraphs: ParagraphData[];
  activeParagraphIndex: number | null;
  onParagraphClick: (index: number) => void;
  highlightText?: string;
  /** When true, constrains height for side-by-side layout with video */
  constrained?: boolean;
}

export function TranscriptPanel({
  paragraphs,
  activeParagraphIndex,
  onParagraphClick,
  highlightText,
  constrained = false,
}: TranscriptPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active paragraph when it changes
  useEffect(() => {
    if (activeParagraphIndex === null || !scrollContainerRef.current) return;

    // The ParagraphBlock handles its own scrollIntoView,
    // but we can ensure the scroll container is the scrolling context
  }, [activeParagraphIndex]);

  if (paragraphs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No transcript available for this speech.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        "transcript-body",
        constrained && "lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-4 scroll-smooth"
      )}
    >
      {paragraphs.map((paragraph) => (
        <ParagraphBlock
          key={paragraph.id}
          index={paragraph.index}
          text={paragraph.text}
          startTime={paragraph.startTime}
          endTime={paragraph.endTime}
          speakerLabel={paragraph.speakerLabel}
          isActive={activeParagraphIndex === paragraph.index}
          highlightText={highlightText}
          onParagraphClick={onParagraphClick}
        />
      ))}
    </div>
  );
}
