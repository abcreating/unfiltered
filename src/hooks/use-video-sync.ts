"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SyncableParagraph {
  index: number;
  startTime: number | null;
  endTime: number | null;
}

interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
}

interface UseVideoSyncOptions {
  paragraphs: SyncableParagraph[];
  playerRef: React.RefObject<VideoPlayerHandle | null>;
  enabled?: boolean;
}

interface UseVideoSyncReturn {
  activeParagraphIndex: number | null;
  seekToParagraph: (index: number) => void;
  handleTimeUpdate: (currentTime: number) => void;
}

export function useVideoSync({
  paragraphs,
  playerRef,
  enabled = true,
}: UseVideoSyncOptions): UseVideoSyncReturn {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Build a sorted list of paragraphs that have timestamps
  const timedParagraphs = useRef<SyncableParagraph[]>([]);
  useEffect(() => {
    timedParagraphs.current = paragraphs
      .filter((p) => p.startTime !== null)
      .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));
  }, [paragraphs]);

  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      if (!enabled) return;

      // Throttle updates to avoid excessive re-renders
      const now = Date.now();
      if (now - lastUpdateRef.current < 200) return;
      lastUpdateRef.current = now;

      const timed = timedParagraphs.current;
      if (timed.length === 0) {
        setActiveParagraphIndex(null);
        return;
      }

      // Find the paragraph whose startTime <= currentTime < next paragraph's startTime
      let activeIdx: number | null = null;

      for (let i = timed.length - 1; i >= 0; i--) {
        const startTime = timed[i].startTime ?? 0;
        if (currentTime >= startTime) {
          activeIdx = timed[i].index;
          break;
        }
      }

      // If current time is before the first timed paragraph, highlight nothing
      if (activeIdx === null && timed.length > 0) {
        const firstStart = timed[0].startTime ?? 0;
        if (currentTime < firstStart) {
          setActiveParagraphIndex(null);
          return;
        }
      }

      setActiveParagraphIndex(activeIdx);
    },
    [enabled]
  );

  const seekToParagraph = useCallback(
    (index: number) => {
      if (!enabled) return;

      const paragraph = paragraphs.find((p) => p.index === index);
      if (!paragraph || paragraph.startTime === null) return;

      const player = playerRef.current;
      if (player) {
        player.seekTo(paragraph.startTime);
      }

      setActiveParagraphIndex(index);
    },
    [paragraphs, playerRef, enabled]
  );

  return {
    activeParagraphIndex,
    seekToParagraph,
    handleTimeUpdate,
  };
}
