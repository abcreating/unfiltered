import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const leaders = await prisma.leader.findMany({
      include: {
        _count: {
          select: {
            speeches: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = leaders.map((leader) => ({
      id: leader.id,
      slug: leader.slug,
      name: leader.name,
      nameLocal: leader.nameLocal,
      country: leader.country,
      countryCode: leader.countryCode,
      role: leader.role,
      photoUrl: leader.photoUrl,
      speechCount: leader._count.speeches,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch leaders:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaders" },
      { status: 500 }
    );
  }
}
