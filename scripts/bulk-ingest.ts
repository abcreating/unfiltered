/**
 * Bulk ingestion script — discovers and ingests real speeches
 * from official government sources.
 *
 * Usage: npx tsx scripts/bulk-ingest.ts
 */

import { PrismaClient, IngestionMethod, IngestionStatus, SpeechStatus } from "../src/generated/prisma";
import { scrapers, discoverablescrapers } from "../src/lib/scrapers";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

interface SpeechEntry {
  url: string;
  scraper: string;
  leaderSlug: string;
  title?: string;
  occasion?: string;
  deliveredAt?: string;
}

// Curated list of VERIFIED working speech URLs
const CURATED_SPEECHES: SpeechEntry[] = [
  // ─── WHITE HOUSE (Trump 2025) ───────────────────────────
  {
    url: "https://www.whitehouse.gov/remarks/2025/01/the-inaugural-address/",
    scraper: "whitehouse",
    leaderSlug: "donald-trump",
    title: "The Inaugural Address 2025",
    occasion: "Presidential Inauguration",
    deliveredAt: "2025-01-20",
  },
  {
    url: "https://www.whitehouse.gov/briefings-statements/2025/01/press-briefing-by-press-secretary-karoline-leavitt/",
    scraper: "whitehouse",
    leaderSlug: "donald-trump",
    title: "Press Briefing by Press Secretary Karoline Leavitt",
    deliveredAt: "2025-01-27",
  },

  // ─── GOV.UK (Starmer / UK Officials) ───────────────────
  {
    url: "https://www.gov.uk/government/speeches/pm-remarks-on-the-situation-in-the-middle-east-5-march-2026",
    scraper: "gov-uk",
    leaderSlug: "keir-starmer",
    title: "PM Remarks on the Situation in the Middle East",
    deliveredAt: "2026-03-05",
  },
  {
    url: "https://www.gov.uk/government/speeches/home-secretarys-speech-on-immigration-5-march-2026",
    scraper: "gov-uk",
    leaderSlug: "keir-starmer",
    title: "Home Secretary's Speech on Immigration",
    deliveredAt: "2026-03-05",
  },
  {
    url: "https://www.gov.uk/government/speeches/education-secretary-speech-at-ascl-conference",
    scraper: "gov-uk",
    leaderSlug: "keir-starmer",
    title: "Education Secretary Speech at ASCL Conference",
    deliveredAt: "2026-03-14",
  },
  {
    url: "https://www.gov.uk/government/speeches/fraud-strategy-launch",
    scraper: "gov-uk",
    leaderSlug: "keir-starmer",
    title: "Fraud Strategy Launch",
    deliveredAt: "2026-03-12",
  },
  {
    url: "https://www.gov.uk/government/speeches/rule-of-law-powering-business-success-investment-and-innovation",
    scraper: "gov-uk",
    leaderSlug: "keir-starmer",
    title: "Rule of Law: Powering Business Success, Investment and Innovation",
    deliveredAt: "2026-03-13",
  },
  {
    url: "https://www.gov.uk/government/speeches/un-human-rights-council-61-uk-statement-for-the-interactive-dialogue-on-syria",
    scraper: "gov-uk",
    leaderSlug: "david-lammy",
    title: "UK Statement on Syria at UN Human Rights Council",
    occasion: "UN Human Rights Council",
    deliveredAt: "2026-03-13",
  },
  {
    url: "https://www.gov.uk/government/speeches/international-womens-day-2026-uk-statement-to-the-osce",
    scraper: "gov-uk",
    leaderSlug: "david-lammy",
    title: "International Women's Day 2026: UK Statement to the OSCE",
    occasion: "OSCE",
    deliveredAt: "2026-03-07",
  },

  // ─── KREMLIN (Putin) — verified working ────────────────
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79213",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79216",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79217",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79220",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79222",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79223",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79225",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79230",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79247",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79255",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79256",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79259",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79260",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79265",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },
  {
    url: "http://en.kremlin.ru/events/president/transcripts/79275",
    scraper: "kremlin",
    leaderSlug: "vladimir-putin",
  },

  // ─── UN (Guterres) — verified working ──────────────────
  {
    url: "https://press.un.org/en/2026/sgsm23041.doc.htm",
    scraper: "un",
    leaderSlug: "antonio-guterres",
    occasion: "Secretary-General Statement",
  },
  {
    url: "https://press.un.org/en/2026/sgsm23042.doc.htm",
    scraper: "un",
    leaderSlug: "antonio-guterres",
    occasion: "Secretary-General Statement",
  },
  {
    url: "https://press.un.org/en/2026/sgsm23043.doc.htm",
    scraper: "un",
    leaderSlug: "antonio-guterres",
    occasion: "Secretary-General Statement",
  },
  {
    url: "https://press.un.org/en/2026/sgsm23044.doc.htm",
    scraper: "un",
    leaderSlug: "antonio-guterres",
    occasion: "Secretary-General Statement",
  },
  {
    url: "https://press.un.org/en/2026/sgsm23045.doc.htm",
    scraper: "un",
    leaderSlug: "antonio-guterres",
    occasion: "Secretary-General Statement",
  },
  {
    url: "https://press.un.org/en/2026/sgsm23046.doc.htm",
    scraper: "un",
    leaderSlug: "antonio-guterres",
    occasion: "Secretary-General Statement",
  },

  // ─── TURKEY (Erdogan) — verified working ───────────────
  {
    url: "https://www.tccb.gov.tr/en/speeches-statements/558/157028/address-at-the-general-debate-of-the-79th-session-of-the-united-nations-general-assembly",
    scraper: "generic",
    leaderSlug: "recep-tayyip-erdogan",
    title: "Address at the 79th UN General Assembly",
    occasion: "UN General Assembly",
    deliveredAt: "2024-09-24",
  },

  // ─── GERMANY (Scholz) — verified working ──────────────
  {
    url: "https://www.bundeskanzler.de/bk-en/news/chancellor-scholz-government-statement-june-2024-2283768",
    scraper: "generic",
    leaderSlug: "olaf-scholz",
    title: "Government Statement on European Council",
    occasion: "European Council",
    deliveredAt: "2024-06-26",
  },
];

async function ingestOne(entry: SpeechEntry): Promise<"ok" | "skip" | "fail"> {
  try {
    // Check duplicate
    const existing = await prisma.speech.findFirst({
      where: { sourceUrl: entry.url },
    });
    if (existing) {
      console.log(`  SKIP (exists): ${entry.url}`);
      return "skip";
    }

    const scraper = scrapers[entry.scraper];
    if (!scraper) {
      console.log(`  FAIL (no scraper: ${entry.scraper}): ${entry.url}`);
      return "fail";
    }

    // Scrape
    const scraped = await scraper.scrape(entry.url);
    const leaderSlug = entry.leaderSlug || scraped.leaderSlug;
    const title = entry.title || scraped.title;
    const deliveredAt = entry.deliveredAt
      ? new Date(entry.deliveredAt)
      : scraped.deliveredAt;

    if (!leaderSlug || !title || scraped.paragraphs.length === 0) {
      console.log(`  FAIL (missing data — leader:${leaderSlug} title:${!!title} paras:${scraped.paragraphs.length}): ${entry.url}`);
      return "fail";
    }

    // Find leader
    const leader = await prisma.leader.findUnique({
      where: { slug: leaderSlug },
    });
    if (!leader) {
      console.log(`  FAIL (leader not found: ${leaderSlug}): ${entry.url}`);
      return "fail";
    }

    // Generate slug
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.speech.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create speech + paragraphs
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
          occasion: entry.occasion || scraped.occasion,
          duration: scraped.duration,
          videoUrl: scraped.videoUrl,
          videoEmbedId: scraped.videoEmbedId,
          sourceUrl: entry.url,
          sourceLabel: entry.scraper,
          status: SpeechStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      await tx.paragraph.createMany({
        data: scraped.paragraphs.map((text, index) => ({
          speechId: s.id,
          index,
          text,
        })),
      });

      return s;
    });

    // Log
    await prisma.ingestionLog.create({
      data: {
        source: entry.url,
        method: IngestionMethod.SCRAPER,
        status: IngestionStatus.COMPLETED,
        speechId: speech.id,
        completedAt: new Date(),
        metadata: {
          paragraphCount: scraped.paragraphs.length,
          leaderSlug,
          scraperName: entry.scraper,
        },
      },
    });

    console.log(`  OK: "${title}" by ${leaderSlug} (${scraped.paragraphs.length} paras)`);
    return "ok";
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`  FAIL: ${entry.url} — ${msg.slice(0, 120)}`);

    await prisma.ingestionLog.create({
      data: {
        source: entry.url,
        method: IngestionMethod.SCRAPER,
        status: IngestionStatus.FAILED,
        completedAt: new Date(),
        error: msg,
      },
    }).catch(() => {});

    return "fail";
  }
}

async function runDiscover() {
  console.log("\n═══ PHASE 1: Auto-discover from scrapers ═══\n");

  const discovered: SpeechEntry[] = [];

  for (const scraper of discoverablescrapers) {
    console.log(`Discovering from ${scraper.name}...`);
    try {
      const urls = await scraper.discover!();
      console.log(`  Found ${urls.length} URLs`);

      for (const url of urls) {
        let leaderSlug = "";
        switch (scraper.name) {
          case "whitehouse":
            leaderSlug = "donald-trump";
            break;
          case "kremlin":
            leaderSlug = "vladimir-putin";
            break;
          case "elysee":
            leaderSlug = "emmanuel-macron";
            break;
          case "pmo-india":
            leaderSlug = "narendra-modi";
            break;
          case "un":
            leaderSlug = "antonio-guterres";
            break;
          case "gov-uk":
            leaderSlug = "keir-starmer";
            break;
        }

        discovered.push({
          url,
          scraper: scraper.name,
          leaderSlug,
        });
      }
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
  }

  return discovered;
}

async function main() {
  console.log("═══ BULK INGESTION SCRIPT ═══\n");

  // Phase 1: Auto-discover
  const discovered = await runDiscover();

  // Phase 2: Curated speeches
  console.log(`\n═══ PHASE 2: Curated speech URLs ═══\n`);
  console.log(`${CURATED_SPEECHES.length} curated + ${discovered.length} discovered = ${CURATED_SPEECHES.length + discovered.length} total\n`);

  // Merge — curated first, then discovered
  const allEntries = [...CURATED_SPEECHES, ...discovered];

  // Dedupe by URL
  const seen = new Set<string>();
  const unique = allEntries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });

  console.log(`Processing ${unique.length} unique URLs...\n`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const entry of unique) {
    const result = await ingestOne(entry);
    if (result === "ok") ok++;
    else if (result === "skip") skip++;
    else fail++;

    // Small delay to be respectful
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n═══ RESULTS ═══`);
  console.log(`  Ingested: ${ok}`);
  console.log(`  Skipped:  ${skip}`);
  console.log(`  Failed:   ${fail}`);
  console.log(`  Total:    ${unique.length}`);

  const totalSpeeches = await prisma.speech.count({
    where: { status: SpeechStatus.PUBLISHED },
  });
  console.log(`\nTotal published speeches in DB: ${totalSpeeches}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
