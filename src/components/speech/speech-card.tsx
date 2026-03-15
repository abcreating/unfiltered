import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LanguageBadge } from "@/components/shared/language-badge";

type SpeechCardTag = {
  slug: string;
  name: string;
};

type SpeechCardProps = {
  slug: string;
  title: string;
  leaderName?: string;
  leaderSlug?: string;
  deliveredAt: Date | string;
  occasion?: string | null;
  originalLang: string;
  tags?: SpeechCardTag[];
  className?: string;
};

export function SpeechCard({
  slug,
  title,
  leaderName,
  leaderSlug,
  deliveredAt,
  occasion,
  originalLang,
  tags = [],
  className,
}: SpeechCardProps) {
  const date =
    typeof deliveredAt === "string" ? new Date(deliveredAt) : deliveredAt;

  return (
    <article
      className={cn(
        "group py-5 border-b border-border/50 last:border-b-0",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/speeches/${slug}`}
            className="block group-hover:text-[#d97706] transition-colors"
          >
            <h3 className="text-base font-medium text-foreground leading-snug">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {leaderName && (
              <span className="text-sm text-muted-foreground">
                {leaderSlug ? (
                  <Link
                    href={`/leaders/${leaderSlug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {leaderName}
                  </Link>
                ) : (
                  leaderName
                )}
              </span>
            )}
            {occasion && (
              <>
                <span className="text-muted-foreground/40" aria-hidden="true">
                  &middot;
                </span>
                <span className="text-sm text-muted-foreground">
                  {occasion}
                </span>
              </>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag.slug}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <LanguageBadge code={originalLang} />
          <time
            dateTime={date.toISOString()}
            className="text-sm text-muted-foreground tabular-nums whitespace-nowrap"
          >
            {format(date, "MMM d, yyyy")}
          </time>
        </div>
      </div>
    </article>
  );
}
