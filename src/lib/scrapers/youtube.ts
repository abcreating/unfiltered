import { YoutubeTranscript } from "youtube-transcript";
import type { ScrapedSpeech, ScraperSource } from "./types";

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function groupTranscriptIntoParagraphs(
  segments: { text: string; offset: number; duration: number }[],
  targetChars = 500
): { text: string; startTime: number; endTime: number }[] {
  const paragraphs: { text: string; startTime: number; endTime: number }[] = [];
  let current = { text: "", startTime: 0, endTime: 0 };

  for (const seg of segments) {
    if (current.text.length === 0) {
      current.startTime = seg.offset / 1000;
    }
    current.text += (current.text ? " " : "") + seg.text.trim();
    current.endTime = (seg.offset + seg.duration) / 1000;

    if (current.text.length >= targetChars) {
      paragraphs.push({ ...current });
      current = { text: "", startTime: 0, endTime: 0 };
    }
  }

  if (current.text.length > 0) {
    paragraphs.push(current);
  }

  return paragraphs;
}

export const youtubeScraper: ScraperSource = {
  name: "youtube",

  async scrape(url: string): Promise<ScrapedSpeech> {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error(`Invalid YouTube URL: ${url}`);
    }

    const segments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!segments || segments.length === 0) {
      throw new Error(`No transcript available for video: ${videoId}`);
    }

    const paragraphs = groupTranscriptIntoParagraphs(segments);

    return {
      title: "", // caller must provide or fetch from YouTube API
      leaderSlug: "", // caller must provide
      paragraphs: paragraphs.map((p) => p.text),
      deliveredAt: new Date(),
      sourceUrl: url,
      videoUrl: url,
      videoEmbedId: videoId,
      originalLang: "en",
    };
  },
};
