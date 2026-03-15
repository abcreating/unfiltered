import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recentSpeeches = await prisma.speech.findMany({
    where: { status: "PUBLISHED" },
    include: {
      leader: { select: { name: true, slug: true } },
    },
    orderBy: { deliveredAt: "desc" },
    take: 6,
  });

  const totalSpeeches = await prisma.speech.count({
    where: { status: "PUBLISHED" },
  });

  const totalLeaders = await prisma.leader.count();

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
          <h1 className="heading-serif text-6xl sm:text-7xl lg:text-8xl text-foreground mb-4">
            Unfiltered
          </h1>
          <p className="heading-serif text-2xl sm:text-3xl text-muted-foreground mb-10">
            What leaders actually said.
          </p>
          <p className="text-base leading-[1.8] text-foreground/80 max-w-xl">
            Full transcripts of speeches by world leaders, in any language, with
            zero editorial framing. {totalSpeeches} speeches from{" "}
            {totalLeaders} leaders and counting.
          </p>

          <div className="flex items-center gap-4 mt-10">
            <Link
              href="/find"
              className="inline-flex items-center gap-2 justify-center px-6 py-3 text-sm font-medium bg-foreground text-background rounded hover:opacity-90 transition-opacity"
            >
              <Search className="size-4" />
              Find the Clip
            </Link>
            <Link
              href="/speeches"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-border rounded text-foreground hover:bg-secondary transition-colors"
            >
              Browse Speeches
            </Link>
          </div>
        </section>

        <div className="rule-stone max-w-5xl mx-auto" />

        {/* Find the Clip feature callout */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="max-w-xl">
            <h2 className="heading-serif text-2xl text-foreground mb-4">
              See a quote on social media?
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-6">
              Paste it into Find the Clip. We&apos;ll locate the exact moment in
              the full transcript and show you what was said before and after. No
              commentary — just context.
            </p>
            <Link
              href="/find"
              className="text-sm link-accent"
            >
              Try it now &rarr;
            </Link>
          </div>
        </section>

        <div className="rule-stone max-w-5xl mx-auto" />

        {/* Recent speeches */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="heading-serif text-2xl text-foreground mb-8">
            Recent Speeches
          </h2>

          <div className="grid gap-6">
            {recentSpeeches.map((speech) => (
              <Link
                key={speech.id}
                href={`/speeches/${speech.slug}`}
                className="group flex items-baseline justify-between py-4 border-b border-border/50 last:border-b-0"
              >
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-foreground group-hover:text-[#d97706] transition-colors">
                    {speech.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {speech.leader.name}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-8 shrink-0">
                  <span className="text-xs text-muted-foreground/60 uppercase tracking-wide">
                    {speech.originalLang}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {format(new Date(speech.deliveredAt), "MMM yyyy")}
                  </span>
                </div>
              </Link>
            ))}

            {recentSpeeches.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                No speeches published yet.
              </p>
            )}
          </div>

          <div className="mt-8">
            <Link
              href="/speeches"
              className="text-sm link-accent"
            >
              View all speeches &rarr;
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
