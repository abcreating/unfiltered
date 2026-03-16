import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SpeechListFilter } from "@/components/speech/speech-list-filter";

export const metadata: Metadata = {
  title: "Speech Archive | Unfiltered",
  description:
    "Browse the full archive of world leader speeches. Full transcripts, no editorial spin.",
};

async function getPublishedSpeeches() {
  const speeches = await prisma.speech.findMany({
    where: { status: "PUBLISHED" },
    include: {
      leader: {
        select: {
          slug: true,
          name: true,
          country: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { deliveredAt: "desc" },
  });

  return speeches;
}

export default async function SpeechesPage() {
  const speeches = await getPublishedSpeeches();

  const serialized = speeches.map((speech) => ({
    slug: speech.slug,
    title: speech.title,
    deliveredAt: speech.deliveredAt.toISOString(),
    occasion: speech.occasion,
    originalLang: speech.originalLang,
    leader: {
      name: speech.leader.name,
      slug: speech.leader.slug,
      country: speech.leader.country,
    },
    tags: speech.tags.map((st) => ({
      slug: st.tag.slug,
      name: st.tag.name,
    })),
  }));

  // Extract unique countries and years for filters
  const countries = Array.from(new Set(serialized.map((s) => s.leader.country))).sort();
  const years = Array.from(new Set(serialized.map((s) => new Date(s.deliveredAt).getFullYear()))).sort((a, b) => b - a);

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-20">
          <h1 className="heading-serif text-3xl sm:text-4xl text-foreground mb-2">
            Transcript Archive
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Full transcripts of speeches, press conferences, and briefings by world leaders.
          </p>

          <SpeechListFilter
            speeches={serialized}
            countries={countries}
            years={years}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
