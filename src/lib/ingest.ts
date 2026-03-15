import prisma from "./prisma";
import { scrapers } from "./scrapers";
import { SpeechStatus, IngestionMethod, IngestionStatus } from "@/generated/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

export async function ingestSpeech(params: {
  sourceUrl: string;
  scraperName: string;
  leaderSlug?: string;
  title?: string;
  deliveredAt?: string;
  occasion?: string;
}): Promise<{ speechId: string; logId: string }> {
  // Create ingestion log
  const log = await prisma.ingestionLog.create({
    data: {
      source: params.sourceUrl,
      method: IngestionMethod.SCRAPER,
      status: IngestionStatus.PROCESSING,
    },
  });

  try {
    const scraper = scrapers[params.scraperName];
    if (!scraper) {
      throw new Error(`Unknown scraper: ${params.scraperName}`);
    }

    // Scrape the source
    const scraped = await scraper.scrape(params.sourceUrl);

    // Override with provided params
    const leaderSlug = params.leaderSlug || scraped.leaderSlug;
    const title = params.title || scraped.title;
    const deliveredAt = params.deliveredAt
      ? new Date(params.deliveredAt)
      : scraped.deliveredAt;

    if (!title) {
      throw new Error("Speech title is required");
    }

    if (!leaderSlug) {
      throw new Error("Leader slug is required");
    }

    if (scraped.paragraphs.length === 0) {
      throw new Error("No paragraphs found in scraped content");
    }

    // Find leader
    const leader = await prisma.leader.findUnique({
      where: { slug: leaderSlug },
    });

    if (!leader) {
      throw new Error(`Leader not found: ${leaderSlug}`);
    }

    // Check for duplicate
    const existing = await prisma.speech.findFirst({
      where: { sourceUrl: params.sourceUrl },
    });

    if (existing) {
      throw new Error(`Speech already exists from this source: ${existing.slug}`);
    }

    // Generate slug
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.speech.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create speech + paragraphs in a transaction
    const speech = await prisma.$transaction(async (tx) => {
      const s = await tx.speech.create({
        data: {
          slug,
          title,
          leaderId: leader.id,
          originalLang: scraped.originalLang || "en",
          deliveredAt,
          venue: scraped.venue,
          city: scraped.city,
          country: scraped.country || leader.country,
          countryCode: scraped.countryCode || leader.countryCode,
          occasion: params.occasion || scraped.occasion,
          duration: scraped.duration,
          videoUrl: scraped.videoUrl,
          videoEmbedId: scraped.videoEmbedId,
          sourceUrl: params.sourceUrl,
          sourceLabel: params.scraperName,
          status: SpeechStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      // Create paragraphs
      await tx.paragraph.createMany({
        data: scraped.paragraphs.map((text, index) => ({
          speechId: s.id,
          index,
          text,
        })),
      });

      return s;
    });

    // Update log
    await prisma.ingestionLog.update({
      where: { id: log.id },
      data: {
        status: IngestionStatus.COMPLETED,
        speechId: speech.id,
        completedAt: new Date(),
        metadata: {
          paragraphCount: scraped.paragraphs.length,
          leaderSlug,
          scraperName: params.scraperName,
        },
      },
    });

    return { speechId: speech.id, logId: log.id };
  } catch (error) {
    // Update log with error
    await prisma.ingestionLog.update({
      where: { id: log.id },
      data: {
        status: IngestionStatus.FAILED,
        completedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      },
    });

    throw error;
  }
}
