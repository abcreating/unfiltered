export interface ScrapedSpeech {
  title: string;
  leaderSlug: string;
  paragraphs: string[];
  deliveredAt: Date;
  sourceUrl: string;
  venue?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  occasion?: string;
  originalLang?: string;
  videoUrl?: string;
  videoEmbedId?: string;
  duration?: number;
}

export interface ScraperSource {
  name: string;
  scrape(url: string): Promise<ScrapedSpeech>;
  discover?(): Promise<string[]>;
}
