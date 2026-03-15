import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canAccessSpeech, recordSpeechView } from "@/lib/paywall";

export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SpeechHeader } from "@/components/speech/speech-header";
import { SpeechViewer } from "@/components/speech/speech-viewer";
import { UpgradeBanner } from "@/components/paywall/upgrade-banner";

interface SpeechPageProps {
  params: { slug: string };
}

async function getSpeech(slug: string) {
  const speech = await prisma.speech.findUnique({
    where: { slug },
    include: {
      leader: true,
      paragraphs: {
        orderBy: { index: "asc" },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!speech || speech.status !== "PUBLISHED") {
    return null;
  }

  return speech;
}

export async function generateMetadata({
  params,
}: SpeechPageProps): Promise<Metadata> {
  const speech = await getSpeech(params.slug);

  if (!speech) {
    return {
      title: "Speech Not Found | Unfiltered",
    };
  }

  return {
    title: `${speech.title} — ${speech.leader.name} | Unfiltered`,
    description: `Full transcript of "${speech.title}" by ${speech.leader.name}${speech.occasion ? `, ${speech.occasion}` : ""}. Read the complete, unedited speech.`,
    openGraph: {
      title: `${speech.title} — ${speech.leader.name}`,
      description: `Full transcript of "${speech.title}" by ${speech.leader.name}. No editorial spin. No summaries.`,
      type: "article",
      publishedTime: speech.deliveredAt.toISOString(),
      authors: [speech.leader.name],
    },
  };
}

export default async function SpeechPage({ params }: SpeechPageProps) {
  const speech = await getSpeech(params.slug);

  if (!speech) {
    notFound();
  }

  // Check paywall
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id || null;
  const access = await canAccessSpeech(userId, speech.id);

  if (access.allowed && userId) {
    await recordSpeechView(userId, speech.id);
  }

  // Serialize data for client components
  const allParagraphs = speech.paragraphs.map((p) => ({
    id: p.id,
    index: p.index,
    text: p.text,
    startTime: p.startTime,
    endTime: p.endTime,
    speakerLabel: p.speakerLabel,
  }));

  // If not allowed, only show first 3 paragraphs
  const serializedParagraphs = access.allowed
    ? allParagraphs
    : allParagraphs.slice(0, 3);

  const serializedLeader = {
    slug: speech.leader.slug,
    name: speech.leader.name,
    nameLocal: speech.leader.nameLocal,
    country: speech.leader.country,
    role: speech.leader.role,
  };

  const serializedTags = speech.tags.map((st) => ({
    tag: {
      slug: st.tag.slug,
      name: st.tag.name,
      category: st.tag.category,
    },
  }));

  return (
    <>
      <Header />

      <main className="flex-1">
        <SpeechHeader
          title={speech.title}
          titleOriginal={speech.titleOriginal}
          leader={serializedLeader}
          deliveredAt={speech.deliveredAt.toISOString()}
          occasion={speech.occasion}
          venue={speech.venue}
          city={speech.city}
          country={speech.country}
          originalLang={speech.originalLang}
          duration={speech.duration}
          sourceUrl={speech.sourceUrl}
          sourceLabel={speech.sourceLabel}
          tags={serializedTags}
        />

        <SpeechViewer
          speechId={speech.id}
          paragraphs={serializedParagraphs}
          videoEmbedId={speech.videoEmbedId}
          videoSource={speech.videoSource}
        />

        {!access.allowed && <UpgradeBanner remaining={access.remaining} />}
      </main>

      <Footer />
    </>
  );
}
