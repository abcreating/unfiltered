import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "About — Unfiltered",
  description:
    "Unfiltered is a non-partisan archive of full-text transcripts of speeches by world leaders. No editorial spin. No summaries. No algorithms.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 pt-16 pb-24">
          {/* Title */}
          <h1 className="heading-serif text-4xl sm:text-5xl text-foreground mb-8">
            About Unfiltered
          </h1>

          {/* Mission */}
          <section className="mb-12">
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Unfiltered is a non-partisan archive of full-text transcripts of
              speeches by world leaders. In an era where a single sentence can
              be clipped, reframed, and spread across the internet in minutes,
              we believe the full record matters.
            </p>
            <p className="text-base leading-[1.8] text-foreground/80">
              Our mission is simple: provide the complete text of what leaders
              actually said, with zero editorial framing, so that anyone can
              read, search, and verify for themselves.
            </p>
          </section>

          <div className="rule-stone mb-12" />

          {/* Principles */}
          <section className="mb-12">
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              Principles
            </h2>
            <ul className="space-y-4">
              {[
                "No editorial spin. No summaries. Raw transcripts only.",
                "Full speeches only \u2014 no excerpts stored as standalone entries.",
                "Every speech is timestamped and source-cited.",
                "Leaders from ALL nations \u2014 not just Western governments.",
                "Explicitly non-partisan: no \u201Cfeatured\u201D leaders, no algorithmic bias.",
              ].map((principle) => (
                <li
                  key={principle}
                  className="flex items-start gap-3 text-base leading-[1.8] text-foreground/80"
                >
                  <span className="mt-[0.6em] block size-1.5 shrink-0 rounded-full bg-amber-600" />
                  {principle}
                </li>
              ))}
            </ul>
          </section>

          <div className="rule-stone mb-12" />

          {/* How Find the Clip works */}
          <section className="mb-12">
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              How &ldquo;Find the Clip&rdquo; Works
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              You see a quote on social media or in the news. Maybe it looks
              damning. Maybe it sounds inspiring. But you only see one sentence.
            </p>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Paste it into our search. We will find the exact moment in the
              full transcript and show you the two paragraphs before and two
              paragraphs after. You get context. You decide what it means.
            </p>
            <p className="text-base leading-[1.8] text-foreground/80">
              No commentary, no spin, no algorithm deciding what you should
              think about it. Just the full text.
            </p>
          </section>

          <div className="rule-stone mb-12" />

          {/* Sources */}
          <section className="mb-12">
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              Sources
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Transcripts are sourced from official government websites,
              parliamentary records, UN archives, verified press offices, and
              other authoritative public sources. Every speech in our archive
              includes a link back to its original source.
            </p>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>Official government press offices and transcript services</li>
              <li>United Nations and international body archives</li>
              <li>National parliamentary and congressional records</li>
              <li>Verified press briefing transcripts</li>
              <li>Community-submitted transcripts (verified before publishing)</li>
            </ul>
          </section>

          <div className="rule-stone mb-12" />

          {/* Contact / Submit */}
          <section>
            <h2 className="heading-serif text-2xl text-foreground mb-6">
              Submit a Speech or Get in Touch
            </h2>
            <p className="text-base leading-[1.8] text-foreground/80 mb-4">
              Know of a speech that should be in our archive? Have a correction
              or a question? We welcome contributions from anyone committed to
              accuracy and completeness.
            </p>
            <p className="text-base leading-[1.8] text-foreground/80">
              Email us at{" "}
              <a
                href="mailto:submit@unfiltered.org"
                className="link-accent"
              >
                submit@unfiltered.org
              </a>{" "}
              or use the{" "}
              <a href="/submit" className="link-accent">
                Submit a Speech
              </a>{" "}
              form to contribute directly.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
