import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClipFinder } from "@/components/search/clip-finder";

export const metadata: Metadata = {
  title: "Find the Clip — Unfiltered",
  description:
    "Paste a quote from the news or social media. We'll find it in the full transcript and show you what was actually said before and after.",
};

export default function FindPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-24">
          <h1 className="heading-serif text-4xl sm:text-5xl text-foreground mb-4">
            Find the Clip
          </h1>
          <p className="text-base leading-[1.8] text-muted-foreground max-w-xl mb-10">
            Paste a quote from the news or social media. We&apos;ll find it in
            the full transcript and show you what was actually said before and
            after.
          </p>

          <ClipFinder />
        </section>
      </main>
      <Footer />
    </>
  );
}
