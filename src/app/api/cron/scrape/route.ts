import { NextRequest, NextResponse } from "next/server";
import { discoverablescrapers } from "@/lib/scrapers";
import { ingestSpeech } from "@/lib/ingest";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { scraper: string; discovered: number; ingested: number; errors: string[] }[] = [];

  for (const scraper of discoverablescrapers) {
    const scraperResult = {
      scraper: scraper.name,
      discovered: 0,
      ingested: 0,
      errors: [] as string[],
    };

    try {
      const urls = await scraper.discover!();
      scraperResult.discovered = urls.length;

      for (const url of urls) {
        // Check if already ingested
        const existing = await prisma.speech.findFirst({
          where: { sourceUrl: url },
        });

        if (existing) continue;

        try {
          await ingestSpeech({
            sourceUrl: url,
            scraperName: scraper.name,
          });
          scraperResult.ingested++;
        } catch (error) {
          scraperResult.errors.push(
            `${url}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      scraperResult.errors.push(
        `discover failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    results.push(scraperResult);
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
  });
}
