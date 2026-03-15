"use client";

import Link from "next/link";

interface UpgradeBannerProps {
  remaining?: number;
}

export function UpgradeBanner({ remaining = 0 }: UpgradeBannerProps) {
  return (
    <div className="relative mt-8">
      {/* Blur overlay */}
      <div className="absolute inset-0 -top-32 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />

      {/* Banner */}
      <div className="relative z-10 border-t border-border py-12 text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
          {remaining === 0
            ? "You\u2019ve used all 20 free reads"
            : "Sign in to read full transcripts"}
        </p>
        <h3 className="heading-serif text-2xl text-foreground mb-2">
          Continue reading with Unfiltered Pro
        </h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Get unlimited access to every speech transcript, translations in 25+
          languages, and new speeches added daily.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Subscribe for $4.99/mo
          </Link>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
