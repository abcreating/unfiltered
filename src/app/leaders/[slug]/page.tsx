import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { SpeechCard } from "@/components/speech/speech-card";

type SpeechTagWithTag = {
  tag: { slug: string; name: string };
};

type LeaderSpeech = {
  id: string;
  slug: string;
  title: string;
  deliveredAt: Date;
  occasion: string | null;
  originalLang: string;
  tags: SpeechTagWithTag[];
};

type LeaderProfile = {
  id: string;
  slug: string;
  name: string;
  nameLocal: string | null;
  country: string;
  role: string;
  photoUrl: string | null;
  bio: string | null;
  languages: string | null;
  speeches: LeaderSpeech[];
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getLeader(slug: string): Promise<LeaderProfile | null> {
  const leader = await prisma.leader.findUnique({
    where: { slug },
    include: {
      speeches: {
        where: { status: "PUBLISHED" },
        orderBy: { deliveredAt: "desc" },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      },
    },
  });

  return leader;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const leader = await getLeader(slug);

  if (!leader) {
    return { title: "Leader Not Found — Unfiltered" };
  }

  const description = leader.bio
    ? leader.bio.slice(0, 160)
    : `${leader.name} — ${leader.role}, ${leader.country}. Browse ${leader.speeches.length} speech transcripts on Unfiltered.`;

  return {
    title: `${leader.name} — Unfiltered`,
    description,
    openGraph: {
      title: leader.name,
      description,
      ...(leader.photoUrl && {
        images: [{ url: leader.photoUrl, alt: leader.name }],
      }),
    },
  };
}

export default async function LeaderProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const leader = await getLeader(slug);

  if (!leader) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-20">
          {/* Header */}
          <div className="mb-10">
            <h1 className="heading-serif text-4xl text-foreground">
              {leader.name}
            </h1>
            {leader.nameLocal && (
              <p className="heading-serif text-xl text-muted-foreground mt-1">
                {leader.nameLocal}
              </p>
            )}

            <p className="text-base text-muted-foreground mt-3">
              {leader.role}
            </p>
            <p className="text-sm text-muted-foreground/70 uppercase tracking-wide mt-1">
              {leader.country}
            </p>

            {/* Languages */}
            {(() => {
              const langs: string[] = leader.languages ? JSON.parse(leader.languages) : [];
              return langs.length > 0 ? (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ opacity: 0.6 }}>
                  Languages
                </span>
                <div className="flex gap-1.5">
                  {langs.map((lang) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 uppercase"
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null;
            })()}

            {/* Bio */}
            {leader.bio && (
              <p className="text-sm text-foreground/80 leading-relaxed mt-6 max-w-2xl">
                {leader.bio}
              </p>
            )}
          </div>

          <div className="rule-stone mb-8" />

          {/* Speeches */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-serif text-2xl text-foreground">
                Speeches
              </h2>
              <span className="text-sm text-muted-foreground tabular-nums">
                {leader.speeches.length}{" "}
                {leader.speeches.length === 1 ? "speech" : "speeches"}
              </span>
            </div>

            {leader.speeches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No published speeches yet.
              </p>
            ) : (
              <div className="divide-y divide-border/50">
                {leader.speeches.map((speech) => (
                  <SpeechCard
                    key={speech.id}
                    slug={speech.slug}
                    title={speech.title}
                    deliveredAt={speech.deliveredAt}
                    occasion={speech.occasion}
                    originalLang={speech.originalLang}
                    tags={speech.tags.map((st) => ({
                      slug: st.tag.slug,
                      name: st.tag.name,
                    }))}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
