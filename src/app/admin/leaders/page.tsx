import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil } from "lucide-react";

async function getLeaders() {
  return prisma.leader.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { speeches: true },
      },
    },
  });
}

export default async function AdminLeadersPage() {
  const leaders = await getLeaders();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-serif text-3xl text-foreground">Leaders</h1>
        <Link href="/admin/leaders/new">
          <Button size="lg" className="gap-2">
            <Plus className="size-4" />
            Add Leader
          </Button>
        </Link>
      </div>

      {leaders.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <Card key={leader.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {leader.name}
                    </CardTitle>
                    {leader.nameLocal && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {leader.nameLocal}
                      </p>
                    )}
                  </div>
                  <Link href={`/admin/leaders/${leader.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    {leader.role}, {leader.country}
                  </p>
                  <p className="text-xs">
                    {leader._count.speeches}{" "}
                    {leader._count.speeches === 1 ? "speech" : "speeches"}
                  </p>
                  {leader.languages && JSON.parse(leader.languages).length > 0 && (
                    <p className="text-xs uppercase tracking-wider">
                      {JSON.parse(leader.languages).join(", ")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">
            No leaders in the archive yet.
          </p>
          <Link href="/admin/leaders/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              Add your first leader
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
