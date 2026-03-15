import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
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
            No editorial spin. No summaries. Full transcripts of speeches by
            world leaders, in any language, with zero framing.
          </p>

          <div className="flex items-center gap-4 mt-10">
            <Link
              href="/speeches"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-foreground text-background rounded hover:opacity-90 transition-opacity"
            >
              Browse Speeches
            </Link>
            <Link
              href="/find"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-border rounded text-foreground hover:bg-secondary transition-colors"
            >
              Find the Clip
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
            {/* Placeholder cards */}
            {[
              {
                title: "Address to the UN General Assembly",
                speaker: "Speaker Name",
                date: "March 2026",
                language: "English",
              },
              {
                title: "State of the Nation Address",
                speaker: "Speaker Name",
                date: "February 2026",
                language: "English",
              },
              {
                title: "Remarks on Climate Policy",
                speaker: "Speaker Name",
                date: "January 2026",
                language: "French",
              },
            ].map((speech) => (
              <article
                key={speech.title}
                className="group flex items-baseline justify-between py-4 border-b border-border/50 last:border-b-0"
              >
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-foreground group-hover:text-[#d97706] transition-colors">
                    {speech.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {speech.speaker}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-8 shrink-0">
                  <span className="text-xs text-muted-foreground/60 uppercase tracking-wide">
                    {speech.language}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {speech.date}
                  </span>
                </div>
              </article>
            ))}
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
