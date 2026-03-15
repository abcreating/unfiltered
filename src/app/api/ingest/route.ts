import { NextRequest, NextResponse } from "next/server";
import { ingestSpeech } from "@/lib/ingest";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, scraper, leaderSlug, title, deliveredAt, occasion } = body;

    if (!sourceUrl || !scraper) {
      return NextResponse.json(
        { error: "sourceUrl and scraper are required" },
        { status: 400 }
      );
    }

    const result = await ingestSpeech({
      sourceUrl,
      scraperName: scraper,
      leaderSlug,
      title,
      deliveredAt,
      occasion,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ingestion failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ingestion failed" },
      { status: 500 }
    );
  }
}
