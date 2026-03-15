"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LeaderCardProps = {
  slug: string;
  name: string;
  role: string;
  country: string;
  speechCount: number;
  className?: string;
};

export function LeaderCard({
  slug,
  name,
  role,
  country,
  speechCount,
  className,
}: LeaderCardProps) {
  return (
    <Link
      href={`/leaders/${slug}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border/60 bg-card px-5 py-4",
        "transition-colors duration-150 hover:bg-secondary/50",
        className
      )}
    >
      <h3 className="heading-serif text-lg text-foreground leading-snug">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {role}
      </p>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-muted-foreground/70 uppercase tracking-wide">
          {country}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {speechCount} {speechCount === 1 ? "speech" : "speeches"}
        </span>
      </div>
    </Link>
  );
}
