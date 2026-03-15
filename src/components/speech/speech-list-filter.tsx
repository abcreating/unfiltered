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
    country?: string;
  };
  tags: SpeechListTag[];
}

interface SpeechListFilterProps {
  speeches: SpeechListItem[];
  countries?: string[];
  years?: number[];
}

export function SpeechListFilter({
  speeches,
  countries = [],
  years = [],
}: SpeechListFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const filtered = useMemo(() => {
    return speeches.filter((speech) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesText =
          speech.title.toLowerCase().includes(q) ||
          speech.leader.name.toLowerCase().includes(q) ||
          (speech.occasion && speech.occasion.toLowerCase().includes(q)) ||
          speech.tags.some((tag) => tag.name.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      if (selectedCountry && speech.leader.country !== selectedCountry) {
        return false;
      }

      if (selectedYear) {
        const speechYear = new Date(speech.deliveredAt).getFullYear();
        if (speechYear !== Number(selectedYear)) return false;
      }

      return true;
    });
  }, [speeches, query, selectedCountry, selectedYear]);

  const hasFilters = query.trim() || selectedCountry || selectedYear;

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Search speeches, leaders, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border-b border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {countries.length > 0 && (
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="text-sm bg-transparent border border-border rounded px-3 py-1.5 text-foreground/80 focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        )}

        {years.length > 0 && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-sm bg-transparent border border-border rounded px-3 py-1.5 text-foreground/80 focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedCountry("");
              setSelectedYear("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      {hasFilters && (
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
