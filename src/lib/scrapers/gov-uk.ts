import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export const govUkScraper: ScraperSource = {
  name: "gov-uk",

  async scrape(url: string): Promise<ScrapedSpeech> {
    const response = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
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
      $("article p, .content p, main p").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) {
          paragraphs.push(text);
        }
      });
    }

    if (paragraphs.length === 0) {
      throw new Error(`No speech content found at ${url}`);
    }

    // Try to detect leader from page content
    let leaderSlug = "keir-starmer";
    const fromText = $(".from a, .metadata .definition-list dd a").text().toLowerCase();
    if (fromText.includes("foreign") || fromText.includes("lammy")) {
      leaderSlug = "david-lammy";
    }

    const dateStr =
      $('meta[name="govuk:first-published-at"]').attr("content") ||
      $("time").first().attr("datetime");

    return {
      title,
      leaderSlug,
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
      // Use gov.uk search API for reliable results
      const response = await fetch(
        "https://www.gov.uk/api/search.json?filter_content_store_document_type=speech&order=-public_timestamp&count=20",
        {
          headers: { "User-Agent": UA },
        }
      );
      if (!response.ok) return [];

      const data = await response.json();
      const urls: string[] = [];

      if (data.results) {
        for (const result of data.results) {
          if (result.link) {
            const fullUrl = `https://www.gov.uk${result.link}`;
            urls.push(fullUrl);
          }
        }
      }

      return urls.slice(0, 20);
    } catch {
      return [];
    }
  },
};
