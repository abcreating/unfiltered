import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, PenLine, Plus } from "lucide-react";

async function getStats() {
  const [totalSpeeches, totalLeaders, publishedSpeeches, draftSpeeches] =
    await Promise.all([
      prisma.speech.count(),
      prisma.leader.count(),
      prisma.speech.count({ where: { status: "PUBLISHED" } }),
      prisma.speech.count({ where: { status: "DRAFT" } }),
    ]);

  return { totalSpeeches, totalLeaders, publishedSpeeches, draftSpeeches };
}

async function getRecentActivity() {
  const recentSpeeches = await prisma.speech.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { leader: true },
  });

  return recentSpeeches.map((s) => ({
    id: s.id,
    title: s.title,
    leaderName: s.leader.name,
    status: s.status,
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentActivity = await getRecentActivity();

  const statCards = [
    {
      label: "Total Speeches",
      value: stats.totalSpeeches,
      icon: FileText,
    },
    {
      label: "Total Leaders",
      value: stats.totalLeaders,
      icon: Users,
    },
    {
      label: "Published",
      value: stats.publishedSpeeches,
      icon: CheckCircle,
    },
    {
      label: "Drafts",
      value: stats.draftSpeeches,
      icon: PenLine,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-serif text-3xl text-foreground">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground/60" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">
                {stat.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3 mb-10">
        <Link href="/admin/speeches/new">
          <Button variant="default" size="lg" className="gap-2">
            <Plus className="size-4" />
            Add Speech
          </Button>
        </Link>
        <Link href="/admin/leaders/new">
          <Button variant="outline" size="lg" className="gap-2">
            <Plus className="size-4" />
            Add Leader
          </Button>
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="heading-serif text-xl text-foreground mb-4">
          Recent Activity
        </h2>
        {recentActivity.length > 0 ? (
          <div className="border border-border rounded-lg divide-y divide-border">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.leaderName}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      item.status === "PUBLISHED" &&
                        "bg-green-100 text-green-800",
                      item.status === "REVIEW" &&
                        "bg-yellow-100 text-yellow-800",
                      item.status === "DRAFT" &&
                        "bg-stone-100 text-stone-600",
                      item.status === "ARCHIVED" &&
                        "bg-stone-100 text-stone-500"
                    )}
                  >
                    {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-lg">
            No recent activity. Add your first speech to get started.
          </p>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
