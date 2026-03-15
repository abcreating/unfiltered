"use client";

import { useState, useRef, useCallback } from "react";
import { VideoPlayer, type VideoPlayerHandle } from "./video-player";
import { TranscriptPanel } from "./transcript-panel";
import { useVideoSync } from "@/hooks/use-video-sync";
import { cn } from "@/lib/utils";
import { Video, Languages, Newspaper, Lightbulb, X } from "lucide-react";

const LANGUAGES = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "tr", name: "Turkish" },
  { code: "id", name: "Indonesian" },
  { code: "vi", name: "Vietnamese" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "nl", name: "Dutch" },
  { code: "el", name: "Greek" },
  { code: "hu", name: "Hungarian" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
  { code: "ur", name: "Urdu" },
];

interface ParagraphData {
  id: string;
  index: number;
  text: string;
  startTime: number | null;
  endTime: number | null;
  speakerLabel: string | null;
}

interface SpeechViewerProps {
  speechId: string;
  speechSlug: string;
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
  speechId,
  speechSlug,
  paragraphs,
  videoEmbedId,
  videoSource,
}: SpeechViewerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedLang, setSelectedLang] = useState("");
  const [translatedParagraphs, setTranslatedParagraphs] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");
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

  async function handleTranslate(lang: string) {
    setSelectedLang(lang);
    setTranslating(true);
    setTranslationError("");

    try {
      const res = await fetch(`/api/speeches/${speechId}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Translation failed");
      }

      const data = await res.json();
      const mapped: Record<string, string> = {};
      for (const tp of data.paragraphs) {
        mapped[tp.paragraphId] = tp.text;
      }
      setTranslatedParagraphs(mapped);
    } catch (err) {
      setTranslationError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  function closeTranslation() {
    setShowTranslation(false);
    setSelectedLang("");
    setTranslatedParagraphs({});
    setTranslationError("");
  }

  const langName = LANGUAGES.find((l) => l.code === selectedLang)?.name || selectedLang;
  const hasTranslation = Object.keys(translatedParagraphs).length > 0;

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
          active={showTranslation}
          onClick={() => setShowTranslation((v) => !v)}
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

      {/* Translation controls */}
      {showTranslation && (
        <div className="mb-8 p-4 border border-border rounded-lg bg-stone-50/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">Translate to:</p>
            {hasTranslation && (
              <button
                onClick={closeTranslation}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                disabled={translating}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border transition-colors",
                  selectedLang === lang.code
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50",
                  translating && "opacity-50 cursor-wait"
                )}
              >
                {lang.name}
              </button>
            ))}
          </div>
          {translating && (
            <p className="mt-3 text-xs text-muted-foreground animate-pulse">
              Translating to {langName}...
            </p>
          )}
          {translationError && (
            <p className="mt-3 text-xs text-red-600">
              Translation is currently in beta. Please try again later.
            </p>
          )}
        </div>
      )}

      {/* Content area */}
      {showVideo && videoEmbedId ? (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 lg:sticky lg:top-6 lg:self-start">
            <VideoPlayer
              ref={playerRef}
              videoEmbedId={videoEmbedId}
              videoSource={videoSource}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <TranscriptPanel
              paragraphs={paragraphs}
              activeParagraphIndex={activeParagraphIndex}
              onParagraphClick={handleParagraphClick}
              speechSlug={speechSlug}
              constrained
            />
          </div>
        </div>
      ) : hasTranslation ? (
        /* Side-by-side: original + translation */
        <div className="space-y-6">
          {paragraphs.map((paragraph) => (
            <div key={paragraph.id} className="flex gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground/60 font-mono mt-1 select-none min-w-[1.5rem] text-right">
                    {paragraph.index + 1}
                  </span>
                  <p className="text-[15px] leading-relaxed text-foreground/90">
                    {paragraph.text}
                  </p>
                </div>
              </div>
              <div className="w-px bg-border" />
              <div className="flex-1">
                <p className="text-[15px] leading-relaxed text-foreground/75 italic">
                  {translatedParagraphs[paragraph.id] || "..."}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TranscriptPanel
          paragraphs={paragraphs}
          activeParagraphIndex={activeParagraphIndex}
          onParagraphClick={handleParagraphClick}
          speechSlug={speechSlug}
        />
      )}
    </div>
  );
}
