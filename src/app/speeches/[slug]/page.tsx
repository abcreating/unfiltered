import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SpeechHeader } from "@/components/speech/speech-header";
import { SpeechViewer } from "@/components/speech/speech-viewer";
import { ReadingProgress } from "@/components/speech/reading-progress";

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

  const serializedParagraphs = speech.paragraphs.map((p) => ({
    id: p.id,
    index: p.index,
    text: p.text,
    startTime: p.startTime,
    endTime: p.endTime,
    speakerLabel: p.speakerLabel,
  }));

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

  const wordCount = speech.paragraphs.reduce(
    (sum, p) => sum + p.text.split(/\s+/).length,
    0
  );

  return (
    <>
      <ReadingProgress />
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
          wordCount={wordCount}
        />

        <SpeechViewer
          speechId={speech.id}
          speechSlug={speech.slug}
          paragraphs={serializedParagraphs}
          videoEmbedId={speech.videoEmbedId}
          videoSource={speech.videoSource}
        />
      </main>

      <Footer />
    </>
  );
}
