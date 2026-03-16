import * as cheerio from "cheerio";
import type { ScrapedSpeech, ScraperSource } from "./types";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export const whitehouseScraper: ScraperSource = {
  name: "whitehouse",

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

    const title = $("h1").first().text().trim() || "White House Remarks";

    const contentSelectors = [
      ".body-content",
      ".page-content",
      ".entry-content",
      '[property="schema:text"]',
      "article .field--type-text-long",
      "article",
      "main",
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

    let occasion = "White House Remarks";
    if (url.includes("/press-conferences/") || url.includes("press-conference")) {
      occasion = "Press Conference";
    } else if (url.includes("/press-briefings/") || url.includes("press-briefing")) {
      occasion = "Press Briefing";
    }

    return {
      title,
      leaderSlug: "donald-trump",
      paragraphs,
      deliveredAt: dateStr ? new Date(dateStr) : new Date(),
      sourceUrl: url,
      country: "United States",
      countryCode: "US",
      originalLang: "en",
      occasion,
    };
  },

  async discover(): Promise<string[]> {
    try {
      // Use sitemap since listing page is JS-rendered
      const sitemapUrls = [
        "https://www.whitehouse.gov/post-sitemap.xml",
        "https://www.whitehouse.gov/post-sitemap2.xml",
      ];

      const urls: string[] = [];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await fetch(sitemapUrl, {
            headers: { "User-Agent": UA },
          });
          if (!response.ok) continue;

          const xml = await response.text();
          const $ = cheerio.load(xml, { xmlMode: true });

          $("url > loc").each((_, el) => {
            const loc = $(el).text().trim();
            if (
              loc.includes("/remarks/") ||
              loc.includes("/press-conferences/") ||
              loc.includes("/press-briefings/") ||
              (loc.includes("/briefings-statements/") &&
                (loc.includes("remarks") || loc.includes("press-conference") || loc.includes("press-briefing")))
            ) {
              if (!urls.includes(loc)) {
                urls.push(loc);
              }
            }
          });
        } catch {
          continue;
        }
      }

      // Sort by URL (newer dates appear later in path) and return most recent
      return urls.slice(-20).reverse();
    } catch {
      return [];
    }
  },
};
