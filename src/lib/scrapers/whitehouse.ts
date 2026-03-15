import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

export const whitehouseScraper: ScraperSource = {
  name: "whitehouse",

  async scrape(url: string): Promise<ScrapedSpeech> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Unfiltered/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("h1").first().text().trim() || "White House Remarks";

    // White House uses .body-content or similar for speech text
    const contentSelectors = [
      ".body-content",
      ".page-content",
      '[property="schema:text"]',
      "article .field--type-text-long",
      "article",
    ];

    const paragraphs: string[] = [];
    for (const selector of contentSelectors) {
      const $content = $(selector);
      if ($content.length > 0) {
        $content.find("p").each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 20) {
            paragraphs.push(text);
          }
        });
        if (paragraphs.length > 0) break;
      }
    }

    if (paragraphs.length === 0) {
      throw new Error(`No speech content found at ${url}`);
    }

    const dateStr =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time").first().attr("datetime");

    return {
      title,
      leaderSlug: "donald-trump",
      paragraphs,
      deliveredAt: dateStr ? new Date(dateStr) : new Date(),
      sourceUrl: url,
      country: "United States",
      countryCode: "US",
      originalLang: "en",
      occasion: "White House Remarks",
    };
  },

  async discover(): Promise<string[]> {
    try {
      const response = await fetch(
        "https://www.whitehouse.gov/briefing-room/speeches-remarks/",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Unfiltered/1.0)",
          },
        }
      );
      if (!response.ok) return [];

      const html = await response.text();
      const $ = cheerio.load(html);

      const urls: string[] = [];
      $("a[href*='/briefing-room/speeches-remarks/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href !== "/briefing-room/speeches-remarks/") {
          const fullUrl = href.startsWith("http")
            ? href
            : `https://www.whitehouse.gov${href}`;
          if (!urls.includes(fullUrl)) {
            urls.push(fullUrl);
          }
        }
      });

      return urls.slice(0, 20);
    } catch {
      return [];
    }
  },
};
