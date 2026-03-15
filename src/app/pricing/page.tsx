"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 py-24">
          <h1 className="heading-serif text-4xl sm:text-5xl text-foreground mb-4">
            Unfiltered Pro
          </h1>
          <p className="text-lg text-muted-foreground mb-16 max-w-lg">
            Full access to every speech, in any language, with zero limits.
          </p>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Free tier */}
            <div className="border border-border p-8">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Free
              </h3>
              <p className="text-3xl font-medium text-foreground mb-6">$0</p>
              <ul className="space-y-3 text-sm text-foreground/80 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">—</span>
                  3 full speech transcripts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">—</span>
                  Browse all leaders & summaries
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">—</span>
                  Search clip finder
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                No credit card required
              </p>
            </div>

            {/* Pro tier */}
            <div className="border-2 border-foreground p-8 relative">
              <div className="absolute -top-3 left-6 bg-foreground text-background px-3 py-0.5 text-xs uppercase tracking-widest">
                Recommended
              </div>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Pro
              </h3>
              <p className="text-3xl font-medium text-foreground mb-1">
                $4.99
                <span className="text-base font-normal text-muted-foreground">
                  /month
                </span>
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Cancel anytime
              </p>
              <ul className="space-y-3 text-sm text-foreground/80 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">+</span>
                  Unlimited speech transcripts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">+</span>
                  Translate to 25+ languages
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">+</span>
                  New speeches added daily
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-medium">+</span>
                  Bookmarks & alerts
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Loading..." : "Subscribe"}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
