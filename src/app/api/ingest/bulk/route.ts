import { NextRequest, NextResponse } from "next/server";
import { ingestSpeech } from "@/lib/ingest";

interface BulkItem {
  sourceUrl: string;
  scraper: string;
  leaderSlug?: string;
  title?: string;
  deliveredAt?: string;
  occasion?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: BulkItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    const results: { sourceUrl: string; status: string; speechId?: string; error?: string }[] = [];

    for (const item of items) {
      try {
        const result = await ingestSpeech({
          sourceUrl: item.sourceUrl,
          scraperName: item.scraper,
          leaderSlug: item.leaderSlug,
          title: item.title,
          deliveredAt: item.deliveredAt,
          occasion: item.occasion,
        });
        results.push({
          sourceUrl: item.sourceUrl,
          status: "success",
          speechId: result.speechId,
        });
      } catch (error) {
        results.push({
          sourceUrl: item.sourceUrl,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      summary: { total: items.length, succeeded, failed },
      results,
    });
  } catch (error) {
    console.error("Bulk ingestion failed:", error);
    return NextResponse.json(
      { error: "Bulk ingestion failed" },
      { status: 500 }
    );
  }
}
