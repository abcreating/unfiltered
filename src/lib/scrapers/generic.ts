import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

function splitIntoParagraphs(html: string): string[] {
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav, header, footer, aside
  $("script, style, nav, header, footer, aside, .nav, .footer, .header, .sidebar").remove();

  // Try to find the main content area
  const contentSelectors = [
    "article",
    '[role="main"]',
    ".post-content",
    ".entry-content",
    ".article-body",
    ".story-body",
    ".field-item",
    ".content-body",
    "main",
    ".content",
  ];

  let contentSelector = "body";
  for (const selector of contentSelectors) {
    if ($(selector).length > 0) {
      contentSelector = selector;
      break;
    }
  }
  const $content = $(contentSelector);

  const paragraphs: string[] = [];
  $content.find("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 30) {
      paragraphs.push(text);
    }
  });

  return paragraphs;
}

export const genericScraper: ScraperSource = {
  name: "generic",

  async scrape(url: string): Promise<ScrapedSpeech> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Unfiltered/1.0; +https://unfiltered-five.vercel.app)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "Untitled Speech";

    const paragraphs = splitIntoParagraphs(html);

    if (paragraphs.length === 0) {
      throw new Error(`No paragraphs found at ${url}`);
    }

    // Try to extract date
    const dateStr =
      $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="date"]').attr("content") ||
      $("time").first().attr("datetime");

    const deliveredAt = dateStr ? new Date(dateStr) : new Date();

    return {
      title,
      leaderSlug: "",
      paragraphs,
      deliveredAt,
      sourceUrl: url,
      originalLang: $("html").attr("lang")?.slice(0, 2) || "en",
    };
  },
};
