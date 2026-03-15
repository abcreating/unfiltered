import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";

interface LeaderData {
  slug: string;
  name: string;
  nameLocal: string | null;
  country: string;
  role: string;
}

interface TagData {
  tag: {
    slug: string;
    name: string;
    category: string;
  };
}

interface SpeechHeaderProps {
  title: string;
  titleOriginal: string | null;
  leader: LeaderData;
  deliveredAt: string;
  occasion: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  originalLang: string;
  duration: number | null;
  sourceUrl: string;
  sourceLabel: string | null;
  tags: TagData[];
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins} min`;
}

function getLanguageName(code: string): string {
  const lang = LANGUAGES.find((l) => l.code === code);
  return lang ? lang.name : code.toUpperCase();
}

export function SpeechHeader({
  title,
  titleOriginal,
  leader,
  deliveredAt,
  occasion,
  venue,
  city,
  country,
  originalLang,
  duration,
  sourceUrl,
  sourceLabel,
  tags,
}: SpeechHeaderProps) {
  const formattedDate = format(new Date(deliveredAt), "MMMM d, yyyy");

  const locationParts = [venue, city, country].filter(Boolean);
  const locationString = locationParts.join(", ");

  return (
    <header className="max-w-3xl mx-auto px-6 pt-12 pb-8">
      {/* Title */}
      <h1 className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6 text-balance">
        {title}
      </h1>

      {/* Original title if different */}
      {titleOriginal && titleOriginal !== title && (
        <p className="heading-serif text-xl text-muted-foreground mb-6 text-balance">
          {titleOriginal}
        </p>
      )}

      {/* Leader info */}
      <div className="mb-4">
        <Link
          href={`/leaders/${leader.slug}`}
          className="text-base font-medium link-accent"
        >
          {leader.name}
        </Link>
        {leader.nameLocal && leader.nameLocal !== leader.name && (
          <span className="text-sm text-muted-foreground ml-2">
            ({leader.nameLocal})
          </span>
        )}
        <p className="text-sm text-muted-foreground mt-0.5">
          {leader.role} &middot; {leader.country}
        </p>
      </div>

      {/* Date and occasion */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3">
        <time dateTime={deliveredAt} className="tabular-nums">
          {formattedDate}
        </time>
        {occasion && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span>{occasion}</span>
          </>
        )}
        {duration && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span>{formatDuration(duration)}</span>
          </>
        )}
      </div>

      {/* Location */}
      {locationString && (
        <p className="text-sm text-muted-foreground mb-4">
          {locationString}
        </p>
      )}

      {/* Meta row: language, source, tags */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        {/* Language badge */}
        <Badge variant="outline" className="gap-1.5">
          <Globe className="size-3" />
          {getLanguageName(originalLang)}
        </Badge>

        {/* Tags */}
        {tags.map(({ tag }) => (
          <Badge key={tag.slug} variant="secondary">
            {tag.name}
          </Badge>
        ))}
      </div>

      {/* Source link */}
      <div className="mt-5">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm link-accent"
        >
          <ExternalLink className="size-3.5" />
          {sourceLabel
            ? `Source: ${sourceLabel}`
            : "Official source"}
        </a>
      </div>

      {/* Rule */}
      <div className="rule-stone mt-8" />
    </header>
  );
}
