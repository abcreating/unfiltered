import type { ScraperSource } from "./types";
import { youtubeScraper } from "./youtube";
import { whitehouseScraper } from "./whitehouse";
import { unScraper } from "./un";
import { govUkScraper } from "./gov-uk";
import { genericScraper } from "./generic";

export const scrapers: Record<string, ScraperSource> = {
  youtube: youtubeScraper,
  whitehouse: whitehouseScraper,
  un: unScraper,
  "gov-uk": govUkScraper,
  generic: genericScraper,
};

export const discoverablescrapers = Object.values(scrapers).filter(
  (s) => s.discover
);

export type ScraperName = keyof typeof scrapers;

export { type ScrapedSpeech, type ScraperSource } from "./types";
