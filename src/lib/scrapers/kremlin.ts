import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

export const kremlinScraper: ScraperSource = {
  name: "kremlin",

  async scrape(url: string): Promise<ScrapedSpeech> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $("h1").first().text().trim() ||
      $(".entry-title").first().text().trim() ||
      "Kremlin Statement";

    const paragraphs: string[] = [];
    const contentSelectors = [
      ".entry-content",
      ".read__internal_content",
      ".article__text",
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
      $("time").first().attr("datetime") ||
      $(".read__published .read__published_dt").first().text().trim();

    return {
      title,
      leaderSlug: "vladimir-putin",
      paragraphs,
      deliveredAt: dateStr ? new Date(dateStr) : new Date(),
      sourceUrl: url,
      country: "Russia",
      countryCode: "RU",
      originalLang: "en",
      occasion: "Kremlin Statement",
    };
  },

  async discover(): Promise<string[]> {
    try {
      const response = await fetch("http://en.kremlin.ru/events/president/transcripts", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const $ = cheerio.load(html);

      const urls: string[] = [];
      $("a[href*='/events/president/transcripts/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href !== "/events/president/transcripts/") {
          const fullUrl = href.startsWith("http")
            ? href
            : `http://en.kremlin.ru${href}`;
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
