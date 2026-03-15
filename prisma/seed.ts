import { PrismaClient, TagCategory, SpeechStatus } from "../src/generated/prisma";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface SeedLeader {
  slug: string;
  name: string;
  nameLocal?: string | null;
  country: string;
  countryCode: string;
  organization?: string | null;
  role: string;
  languages: string[];
  bio?: string | null;
  photoUrl?: string | null;
}

interface SeedParagraph {
  index: number;
  text: string;
  startTime?: number | null;
  endTime?: number | null;
  speakerLabel?: string | null;
}

interface SeedSpeech {
  leaderSlug: string;
  slug: string;
  title: string;
  titleOriginal?: string | null;
  originalLang: string;
  deliveredAt: string;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  occasion?: string | null;
  duration?: number | null;
  videoUrl?: string | null;
  videoSource?: string | null;
  videoEmbedId?: string | null;
  sourceUrl: string;
  sourceLabel?: string | null;
  tags: string[];
  paragraphs: SeedParagraph[];
}

interface SeedTag {
  slug: string;
  name: string;
  category: string;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.paragraphTranslation.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.speechTag.deleteMany();
  await prisma.mediaReport.deleteMany();
  await prisma.aiContext.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.ingestionLog.deleteMany();
  await prisma.paragraph.deleteMany();
  await prisma.speech.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.leader.deleteMany();

  // Seed tags
  console.log("Seeding tags...");
  const tagsPath = path.join(__dirname, "../seed-data/tags.json");
  const tagsData: SeedTag[] = JSON.parse(fs.readFileSync(tagsPath, "utf-8"));

  const tagMap: Record<string, string> = {};
  for (const tag of tagsData) {
    const created = await prisma.tag.create({
      data: {
        slug: tag.slug,
        name: tag.name,
        category: tag.category as TagCategory,
      },
    });
    tagMap[tag.slug] = created.id;
  }
  console.log(`  Created ${Object.keys(tagMap).length} tags`);

  // Seed leaders
  console.log("Seeding leaders...");
  const leadersPath = path.join(__dirname, "../seed-data/leaders.json");
  const leadersData: SeedLeader[] = JSON.parse(
    fs.readFileSync(leadersPath, "utf-8")
  );

  const leaderMap: Record<string, string> = {};
  for (const leader of leadersData) {
    const created = await prisma.leader.upsert({
      where: { slug: leader.slug },
      update: {
        name: leader.name,
        nameLocal: leader.nameLocal,
        country: leader.country,
        countryCode: leader.countryCode,
        organization: leader.organization,
        role: leader.role,
        languages: JSON.stringify(leader.languages),
        bio: leader.bio,
        photoUrl: leader.photoUrl,
      },
      create: {
        slug: leader.slug,
        name: leader.name,
        nameLocal: leader.nameLocal,
        country: leader.country,
        countryCode: leader.countryCode,
        organization: leader.organization,
        role: leader.role,
        languages: JSON.stringify(leader.languages),
        bio: leader.bio,
        photoUrl: leader.photoUrl,
      },
    });
    leaderMap[leader.slug] = created.id;
  }
  console.log(`  Created ${Object.keys(leaderMap).length} leaders`);

  // Seed speeches
  console.log("Seeding speeches...");
  const speechesDir = path.join(__dirname, "../seed-data/speeches");

  if (!fs.existsSync(speechesDir)) {
    console.log("  No speeches directory found, skipping...");
    return;
  }

  const speechFiles = fs
    .readdirSync(speechesDir)
    .filter((f) => f.endsWith(".json"));

  let speechCount = 0;
  let paragraphCount = 0;

  for (const file of speechFiles) {
    const filePath = path.join(speechesDir, file);
    const speechData: SeedSpeech = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    const leaderId = leaderMap[speechData.leaderSlug];
    if (!leaderId) {
      console.warn(
        `  Warning: Leader "${speechData.leaderSlug}" not found for speech "${speechData.title}", skipping...`
      );
      continue;
    }

    // Create speech
    const speech = await prisma.speech.create({
      data: {
        slug: speechData.slug,
        title: speechData.title,
        titleOriginal: speechData.titleOriginal,
        leaderId,
        originalLang: speechData.originalLang,
        deliveredAt: new Date(speechData.deliveredAt),
        venue: speechData.venue,
        city: speechData.city,
        country: speechData.country,
        countryCode: speechData.countryCode,
        occasion: speechData.occasion,
        duration: speechData.duration,
        videoUrl: speechData.videoUrl,
        videoSource: speechData.videoSource,
        videoEmbedId: speechData.videoEmbedId,
        sourceUrl: speechData.sourceUrl,
        sourceLabel: speechData.sourceLabel,
        status: SpeechStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Create paragraphs
    for (const para of speechData.paragraphs) {
      await prisma.paragraph.create({
        data: {
          speechId: speech.id,
          index: para.index,
          text: para.text,
          startTime: para.startTime,
          endTime: para.endTime,
          speakerLabel: para.speakerLabel,
        },
      });
      paragraphCount++;
    }

    // Create tag associations
    for (const tagSlug of speechData.tags) {
      const tagId = tagMap[tagSlug];
      if (tagId) {
        await prisma.speechTag.create({
          data: {
            speechId: speech.id,
            tagId,
          },
        });
      } else {
        console.warn(
          `  Warning: Tag "${tagSlug}" not found for speech "${speechData.title}"`
        );
      }
    }

    speechCount++;
    console.log(
      `  Created speech: "${speechData.title}" (${speechData.paragraphs.length} paragraphs)`
    );
  }

  console.log(`\nSeeding complete!`);
  console.log(`  ${Object.keys(tagMap).length} tags`);
  console.log(`  ${Object.keys(leaderMap).length} leaders`);
  console.log(`  ${speechCount} speeches`);
  console.log(`  ${paragraphCount} paragraphs`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
