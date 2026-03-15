"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SpeechCard } from "./speech-card";

interface SpeechListTag {
  slug: string;
  name: string;
}

interface SpeechListItem {
  slug: string;
  title: string;
  deliveredAt: string;
  occasion: string | null;
  originalLang: string;
  leader: {
    name: string;
    slug: string;
  };
  tags: SpeechListTag[];
}

interface SpeechListFilterProps {
  speeches: SpeechListItem[];
}

export function SpeechListFilter({ speeches }: SpeechListFilterProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return speeches;

    const q = query.toLowerCase();
    return speeches.filter((speech) => {
      return (
        speech.title.toLowerCase().includes(q) ||
        speech.leader.name.toLowerCase().includes(q) ||
        (speech.occasion && speech.occasion.toLowerCase().includes(q)) ||
        speech.tags.some((tag) => tag.name.toLowerCase().includes(q))
      );
    });
  }, [speeches, query]);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Search speeches, leaders, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border-b border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Results count */}
      {query.trim() && (
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? "speech" : "speeches"} found
        </p>
      )}

      {/* Speech list */}
      {filtered.length > 0 ? (
        <div>
          {filtered.map((speech) => (
            <SpeechCard
              key={speech.slug}
              slug={speech.slug}
              title={speech.title}
              leaderName={speech.leader.name}
              leaderSlug={speech.leader.slug}
              deliveredAt={speech.deliveredAt}
              occasion={speech.occasion}
              originalLang={speech.originalLang}
              tags={speech.tags}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">
            No speeches match your search.
          </p>
        </div>
      )}
    </div>
  );
}
