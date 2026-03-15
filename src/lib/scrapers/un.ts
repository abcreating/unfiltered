import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

export const unScraper: ScraperSource = {
  name: "un",

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

    const title = $("h1").first().text().trim() || "UN Statement";

    const paragraphs: string[] = [];
    const contentSelectors = [
      ".field--name-body",
      ".field-item",
      "article .content",
      ".node-content",
      "article",
    ];

    for (const selector of contentSelectors) {
      $(selector)
        .find("p")
        .each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 20) {
            paragraphs.push(text);
          }
        });
      if (paragraphs.length > 0) break;
    }

    if (paragraphs.length === 0) {
      throw new Error(`No content found at ${url}`);
    }

    const dateStr =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time").first().attr("datetime");

    return {
      title,
      leaderSlug: "antonio-guterres",
      paragraphs,
      deliveredAt: dateStr ? new Date(dateStr) : new Date(),
      sourceUrl: url,
      venue: "United Nations",
      city: "New York",
      country: "United States",
      countryCode: "US",
      originalLang: "en",
    };
  },

  async discover(): Promise<string[]> {
    try {
      const response = await fetch(
        "https://press.un.org/en/secretary-general",
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
      $("a[href*='/en/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("statement") || href?.includes("speech") || href?.includes("remarks")) {
          const fullUrl = href.startsWith("http")
            ? href
            : `https://press.un.org${href}`;
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
