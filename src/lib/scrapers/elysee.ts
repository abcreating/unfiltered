import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

export const elyseeScraper: ScraperSource = {
  name: "elysee",

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
      $(".article-header__title").first().text().trim() ||
      "Élysée Statement";

    const paragraphs: string[] = [];
    const contentSelectors = [
      ".article-content",
      ".field--name-body",
      ".article__body",
      "article .content",
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
      leaderSlug: "emmanuel-macron",
      paragraphs,
      deliveredAt: dateStr ? new Date(dateStr) : new Date(),
      sourceUrl: url,
      country: "France",
      countryCode: "FR",
      originalLang: "fr",
      occasion: "Élysée Statement",
    };
  },

  async discover(): Promise<string[]> {
    try {
      const response = await fetch(
        "https://www.elysee.fr/en/all-the-news?categories%5B%5D=speeches-and-statements",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          },
        }
      );
      if (!response.ok) return [];

      const html = await response.text();
      const $ = cheerio.load(html);

      const urls: string[] = [];
      $("a[href*='/en/emmanuel-macron/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          const fullUrl = href.startsWith("http")
            ? href
            : `https://www.elysee.fr${href}`;
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
