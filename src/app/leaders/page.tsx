import { Suspense } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeaderCard } from "@/components/leader/leader-card";
import { LeaderFilter } from "@/components/leader/leader-filter";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Leaders — Unfiltered",
  description:
    "Browse world leaders and economic officials whose speeches are archived in Unfiltered.",
};

type LeaderWithCount = {
  id: string;
  slug: string;
  name: string;
  country: string;
  organization: string | null;
  role: string;
  _count: { speeches: number };
};

async function getLeaders(country?: string): Promise<LeaderWithCount[]> {
  const where = country ? { country } : {};

  const leaders = await prisma.leader.findMany({
    where,
    select: {
      id: true,
      slug: true,
      name: true,
      country: true,
      organization: true,
      role: true,
      _count: {
        select: { speeches: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return leaders;
}

async function getDistinctCountries(): Promise<string[]> {
  const results = await prisma.leader.findMany({
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  });
  return results.map((r: { country: string }) => r.country);
}

function categorizeLeaders(leaders: LeaderWithCount[]) {
  const headsOfState: LeaderWithCount[] = [];
  const economicLeaders: LeaderWithCount[] = [];

  for (const leader of leaders) {
    if (leader.organization) {
      economicLeaders.push(leader);
    } else {
      headsOfState.push(leader);
    }
  }

  return { headsOfState, economicLeaders };
}

function LeaderGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border/60 bg-card px-5 py-4"
        >
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderSection({
  title,
  leaders,
}: {
  title: string;
  leaders: LeaderWithCount[];
}) {
  if (leaders.length === 0) return null;

  return (
    <section>
      <h2 className="heading-serif text-xl text-foreground mb-5">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaders.map((leader) => (
          <LeaderCard
            key={leader.id}
            slug={leader.slug}
            name={leader.name}
            role={leader.role}
            country={leader.country}
            speechCount={leader._count.speeches}
          />
        ))}
      </div>
    </section>
  );
}

async function LeadersContent({
  country,
}: {
  country?: string;
}) {
  const [leaders, countries] = await Promise.all([
    getLeaders(country),
    getDistinctCountries(),
  ]);

  const { headsOfState, economicLeaders } = categorizeLeaders(leaders);

  if (leaders.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mb-8">
          <div />
          <Suspense>
            <LeaderFilter countries={countries} />
          </Suspense>
        </div>
        <p className="text-muted-foreground text-sm">
          No leaders found{country ? ` for "${country}"` : ""}. Try adjusting
          the filter.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <p className="text-sm text-muted-foreground tabular-nums">
          {leaders.length} {leaders.length === 1 ? "leader" : "leaders"}
        </p>
        <Suspense>
          <LeaderFilter countries={countries} />
        </Suspense>
      </div>

      <div className="space-y-12">
        <LeaderSection
          title="Heads of State & Government"
          leaders={headsOfState}
        />
        <LeaderSection
          title="Economic & Financial Leaders"
          leaders={economicLeaders}
        />
      </div>
    </>
  );
}

export default async function LeadersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const country =
    typeof params.country === "string" ? params.country : undefined;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-20">
          <h1 className="heading-serif text-4xl text-foreground mb-2">
            Leaders
          </h1>
          <p className="text-base text-muted-foreground mb-8">
            Browse by world leader or economic official.
          </p>

          <div className="rule-stone mb-10" />

          <Suspense fallback={<LeaderGridSkeleton />}>
            <LeadersContent country={country} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
