import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

export const govUkScraper: ScraperSource = {
  name: "gov-uk",

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

    const title = $("h1").first().text().trim() || "UK Government Speech";

    const paragraphs: string[] = [];
    $(".govspeak p, .body p, .govuk-body p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length === 0) {
      $("article p, .content p").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) {
          paragraphs.push(text);
        }
      });
    }

    if (paragraphs.length === 0) {
      throw new Error(`No speech content found at ${url}`);
    }

    const dateStr =
      $('meta[name="govuk:first-published-at"]').attr("content") ||
      $("time").first().attr("datetime");

    return {
      title,
      leaderSlug: "keir-starmer",
      paragraphs,
      deliveredAt: dateStr ? new Date(dateStr) : new Date(),
      sourceUrl: url,
      country: "United Kingdom",
      countryCode: "GB",
      originalLang: "en",
    };
  },

  async discover(): Promise<string[]> {
    try {
      const response = await fetch(
        "https://www.gov.uk/search/all?content_purpose_supergroup%5B%5D=news_and_communications&content_store_document_type%5B%5D=speech&order=updated-newest",
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
      $("a.gem-c-document-list__item-title").each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          const fullUrl = href.startsWith("http")
            ? href
            : `https://www.gov.uk${href}`;
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
