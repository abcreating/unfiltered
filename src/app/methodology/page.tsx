import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Methodology — Unfiltered",
  description:
    "How Unfiltered sources, verifies, and publishes full-text transcripts of speeches by world leaders.",
};

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 pt-16 pb-24">
          <h1 className="heading-serif text-4xl sm:text-5xl text-foreground mb-8">
            Methodology
          </h1>

          <section className="mb-12">
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              Sourcing
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Every transcript in our archive comes from an authoritative public
              source. We prioritize official government transcript services,
              parliamentary records, and verified press offices. Each speech
              entry links directly to its original source so readers can verify
              independently.
            </p>
            <ul className="space-y-2 text-sm text-foreground/70 ml-4">
              <li>Official government websites and press offices</li>
              <li>United Nations and international body archives</li>
              <li>National parliamentary and congressional records</li>
              <li>Verified video transcripts from official channels</li>
            </ul>
          </section>

          <div className="rule-stone mb-12" />

          <section className="mb-12">
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              Verification
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Transcripts are cross-referenced against official sources before
              publication. When multiple transcript versions exist, we use the
              version from the speaker&apos;s own government or organization.
              Community-submitted transcripts undergo additional review before
              appearing in the archive.
            </p>
          </section>

          <div className="rule-stone mb-12" />

          <section className="mb-12">
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              Translation
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Translations are provided as a convenience to help readers access
              speeches delivered in other languages. They are generated using
              automated translation services and may not perfectly capture
              nuance, idiom, or rhetorical tone. The original-language
              transcript is always the authoritative text.
            </p>
            <p className="text-base leading-[1.8] text-foreground/80">
              Translation is currently in beta. We are working to improve
              quality and expand language coverage.
            </p>
          </section>

          <div className="rule-stone mb-12" />

          <section>
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              Editorial Policy
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Unfiltered does not editorialize, summarize, or frame any speech.
              We do not select &ldquo;featured&rdquo; speeches based on
              political relevance or controversy. Speeches are listed
              chronologically and by leader, with no algorithmic ranking or
              recommendation system.
            </p>
            <p className="text-base leading-[1.8] text-foreground/80">
              Our goal is to be a neutral, comprehensive archive — not a
              commentary platform.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
