"use client";

import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/constants";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

type LanguageBadgeProps = {
  /** ISO 639 language code (e.g. "en", "uk", "ru") */
  code: string;
  /** Whether this is a verified (human/official) translation or machine-generated */
  verified?: boolean;
  /** Show tooltip with full language name on hover */
  showTooltip?: boolean;
  className?: string;
};

function getLanguageName(code: string): string {
  const lang = LANGUAGES.find(
    (l) => l.code.toLowerCase() === code.toLowerCase()
  );
  return lang?.name ?? code.toUpperCase();
}

function LanguageBadgeInner({
  code,
  verified = true,
  className,
}: Omit<LanguageBadgeProps, "showTooltip">) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded",
        verified
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
          : "bg-stone-100 text-stone-500 ring-1 ring-stone-200/60",
        className
      )}
    >
      {code.toUpperCase()}
    </span>
  );
}

export function LanguageBadge({
  code,
  verified = true,
  showTooltip = true,
  className,
}: LanguageBadgeProps) {
  if (!showTooltip) {
    return (
      <LanguageBadgeInner
        code={code}
        verified={verified}
        className={className}
      />
    );
  }

  const fullName = getLanguageName(code);
  const label = verified ? fullName : `${fullName} (machine translated)`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="inline-flex">
              <LanguageBadgeInner
                code={code}
                verified={verified}
                className={className}
              />
            </span>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
