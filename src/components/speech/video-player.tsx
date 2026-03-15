"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";

// ─── YouTube IFrame API type declarations ───────────────────

interface YTPlayerOptions {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: () => void;
    onError?: () => void;
    onStateChange?: (event: { data: number }) => void;
  };
}

interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTStatic {
  Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YTStatic;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

// ─── Component ──────────────────────────────────────────────

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  videoEmbedId: string;
  videoSource?: string | null;
  onTimeUpdate?: (currentTime: number) => void;
}

const PLAYING_STATE = 1;

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ videoEmbedId, videoSource, onTimeUpdate }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [error, setError] = useState(false);
    const [apiReady, setApiReady] = useState(false);

    // Expose imperative methods
    useImperativeHandle(
      ref,
      () => ({
        seekTo: (seconds: number) => {
          if (playerRef.current) {
            playerRef.current.seekTo(seconds, true);
            playerRef.current.playVideo();
          }
        },
        getCurrentTime: () => {
          if (playerRef.current) {
            return playerRef.current.getCurrentTime();
          }
          return 0;
        },
      }),
      []
    );

    // Start time reporting interval
    const startTimeReporting = useCallback(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (playerRef.current && onTimeUpdate) {
          try {
            const state = playerRef.current.getPlayerState();
            if (state === PLAYING_STATE) {
              onTimeUpdate(playerRef.current.getCurrentTime());
            }
          } catch {
            // Player not ready yet
          }
        }
      }, 500);
    }, [onTimeUpdate]);

    // Load YouTube IFrame API
    useEffect(() => {
      if (videoSource !== "youtube" && videoSource !== null && videoSource !== undefined) {
        setError(true);
        return;
      }

      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        setApiReady(true);
        return;
      }

      // Load the API script
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      const readyHandler = () => {
        if (prevCallback) prevCallback();
        setApiReady(true);
      };
      window.onYouTubeIframeAPIReady = readyHandler;

      return () => {
        if (window.onYouTubeIframeAPIReady === readyHandler) {
          window.onYouTubeIframeAPIReady = prevCallback;
        }
      };
    }, [videoSource]);

    // Initialize player once API is ready
    useEffect(() => {
      if (!apiReady || !containerRef.current || error) return;

      // Create a div for the player inside the container
      const playerDiv = document.createElement("div");
      playerDiv.id = `yt-player-${videoEmbedId}`;
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(playerDiv);

      try {
        playerRef.current = new window.YT.Player(playerDiv.id, {
          videoId: videoEmbedId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            cc_load_policy: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              startTimeReporting();
            },
            onError: () => {
              setError(true);
            },
          },
        });
      } catch {
        setError(true);
      }

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {
            // Player may already be destroyed
          }
        }
        playerRef.current = null;
      };
    }, [apiReady, videoEmbedId, error, startTimeReporting]);

    if (error) {
      return (
        <div className="bg-stone-100 dark:bg-stone-900 rounded-md p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Video could not be embedded.
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${videoEmbedId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm link-accent"
          >
            Watch on YouTube &rarr;
          </a>
        </div>
      );
    }

    return (
      <div className="relative w-full overflow-hidden rounded-md bg-stone-950" style={{ aspectRatio: "16/9" }}>
        <div ref={containerRef} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" />
      </div>
    );
  }
);
