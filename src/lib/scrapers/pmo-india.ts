import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

export const pmoIndiaScraper: ScraperSource = {
  name: "pmo-india",

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
      $(".press-title").first().text().trim() ||
      "PM India Statement";

    const paragraphs: string[] = [];
    const contentSelectors = [
      ".press-content-text",
      ".field--name-body",
      ".node__content",
      "article .content",
      ".content-area",
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
      leaderSlug: "narendra-modi",
      paragraphs,
      deliveredAt: dateStr ? new Date(dateStr) : new Date(),
      sourceUrl: url,
      country: "India",
      countryCode: "IN",
      originalLang: "en",
      occasion: "PM India Statement",
    };
  },

  async discover(): Promise<string[]> {
    try {
      const response = await fetch("https://www.pmindia.gov.in/en/news_updates/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const $ = cheerio.load(html);

      const urls: string[] = [];
      $("a[href*='/en/news_updates/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href !== "/en/news_updates/" && href.length > 25) {
          const fullUrl = href.startsWith("http")
            ? href
            : `https://www.pmindia.gov.in${href}`;
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
