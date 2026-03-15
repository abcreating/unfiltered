import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Submit a Speech — Unfiltered",
  description:
    "Help expand the archive. Submit a speech transcript for review and inclusion in the Unfiltered archive.",
};

export default function SubmitPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-24">
          <h1 className="heading-serif text-4xl sm:text-5xl text-foreground mb-4">
            Submit a Speech
          </h1>
          <p className="text-base leading-[1.8] text-muted-foreground max-w-xl mb-10">
            Know of a speech that should be in our archive? Help us build the
            most comprehensive collection of world leader transcripts.
          </p>

          <div className="space-y-8">
            <div>
              <h2 className="heading-serif text-xl text-foreground mb-3">
                What we&apos;re looking for
              </h2>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-3">
                  <span className="mt-[0.6em] block size-1.5 shrink-0 rounded-full bg-amber-600" />
                  Full-text transcripts of speeches by heads of state, prime
                  ministers, foreign ministers, or leaders of international
                  organizations
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[0.6em] block size-1.5 shrink-0 rounded-full bg-amber-600" />
                  Speeches delivered between 2023 and the present
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[0.6em] block size-1.5 shrink-0 rounded-full bg-amber-600" />
                  A link to the original source (government website,
                  parliamentary record, official video)
                </li>
              </ul>
            </div>

            <div className="rule-stone" />

            <div>
              <h2 className="heading-serif text-xl text-foreground mb-3">
                How to submit
              </h2>
              <p className="text-base leading-[1.8] text-foreground/80 mb-4">
                Send the speech URL (or transcript text) along with the
                speaker&apos;s name, date, and occasion to:
              </p>
              <a
                href="mailto:submit@unfiltered.org"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-foreground text-background rounded hover:opacity-90 transition-opacity"
              >
                submit@unfiltered.org
              </a>
              <p className="text-xs text-muted-foreground mt-4">
                All submissions are reviewed for accuracy and completeness
                before publication.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
