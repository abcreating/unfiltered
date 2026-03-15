import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { variant: "default" | "secondary" | "outline"; className: string }> = {
  PUBLISHED: { variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
  REVIEW: { variant: "default", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  DRAFT: { variant: "secondary", className: "bg-stone-100 text-stone-600 border-stone-200" },
  ARCHIVED: { variant: "secondary", className: "bg-stone-100 text-stone-500 border-stone-200" },
};

async function getSpeeches() {
  return prisma.speech.findMany({
    orderBy: { deliveredAt: "desc" },
    include: {
      leader: {
        select: { name: true, slug: true },
      },
    },
  });
}

export default async function AdminSpeechesPage() {
  const speeches = await getSpeeches();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-serif text-3xl text-foreground">Speeches</h1>
        <Link href="/admin/speeches/new">
          <Button size="lg" className="gap-2">
            <Plus className="size-4" />
            Add Speech
          </Button>
        </Link>
      </div>

      {speeches.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">
                  Title
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">
                  Leader
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">
                  Date
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">
                  Status
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">
                  Language
                </th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {speeches.map((speech) => {
                const style = statusStyles[speech.status] ?? statusStyles.DRAFT;
                return (
                  <tr
                    key={speech.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground line-clamp-1">
                        {speech.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {speech.leader.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(speech.deliveredAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={style.variant}
                        className={style.className}
                      >
                        {speech.status.charAt(0) +
                          speech.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground uppercase text-xs tracking-wider">
                      {speech.originalLang}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/speeches/${speech.id}`}
                        className="text-sm link-accent"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">
            No speeches in the archive yet.
          </p>
          <Link href="/admin/speeches/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              Add your first speech
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
