"use client";

import { useState, useRef, useCallback } from "react";
import { VideoPlayer, type VideoPlayerHandle } from "./video-player";
import { TranscriptPanel } from "./transcript-panel";
import { useVideoSync } from "@/hooks/use-video-sync";
import { cn } from "@/lib/utils";
import { Video, Languages, Newspaper, Lightbulb } from "lucide-react";

interface ParagraphData {
  id: string;
  index: number;
  text: string;
  startTime: number | null;
  endTime: number | null;
  speakerLabel: string | null;
}

interface SpeechViewerProps {
  paragraphs: ParagraphData[];
  videoEmbedId?: string | null;
  videoSource?: string | null;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function SpeechViewer({
  paragraphs,
  videoEmbedId,
  videoSource,
}: SpeechViewerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const playerRef = useRef<VideoPlayerHandle | null>(null);

  const hasVideo = Boolean(videoEmbedId);

  const { activeParagraphIndex, seekToParagraph, handleTimeUpdate } = useVideoSync({
    paragraphs,
    playerRef: playerRef as React.RefObject<VideoPlayerHandle | null>,
    enabled: showVideo && hasVideo,
  });

  const handleParagraphClick = useCallback(
    (index: number) => {
      if (showVideo && hasVideo) {
        seekToParagraph(index);
      }
    },
    [showVideo, hasVideo, seekToParagraph]
  );

  const handleVideoTimeUpdate = useCallback(
    (currentTime: number) => {
      handleTimeUpdate(currentTime);
    },
    [handleTimeUpdate]
  );

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-8 pb-4 border-b border-border/50">
        <ToolbarButton
          icon={<Video className="size-4" />}
          label="Video"
          active={showVideo}
          disabled={!hasVideo}
          onClick={() => setShowVideo((v) => !v)}
        />
        <ToolbarButton
          icon={<Languages className="size-4" />}
          label="Translation"
          active={false}
          disabled
          onClick={() => {}}
        />
        <ToolbarButton
          icon={<Newspaper className="size-4" />}
          label="Media"
          active={false}
          disabled
          onClick={() => {}}
        />
        <ToolbarButton
          icon={<Lightbulb className="size-4" />}
          label="Context"
          active={false}
          disabled
          onClick={() => {}}
        />
      </div>

      {/* Content area */}
      {showVideo && videoEmbedId ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video player */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-6 lg:self-start">
            <VideoPlayer
              ref={playerRef}
              videoEmbedId={videoEmbedId}
              videoSource={videoSource}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          </div>

          {/* Transcript alongside video */}
          <div className="w-full lg:w-1/2">
            <TranscriptPanel
              paragraphs={paragraphs}
              activeParagraphIndex={activeParagraphIndex}
              onParagraphClick={handleParagraphClick}
              constrained
            />
          </div>
        </div>
      ) : (
        /* Full-width transcript */
        <TranscriptPanel
          paragraphs={paragraphs}
          activeParagraphIndex={activeParagraphIndex}
          onParagraphClick={handleParagraphClick}
        />
      )}
    </div>
  );
}
