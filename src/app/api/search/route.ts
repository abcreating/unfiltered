import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const q = searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const where = {
      status: "PUBLISHED" as const,
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { titleOriginal: { contains: q, mode: "insensitive" as const } },
        { occasion: { contains: q, mode: "insensitive" as const } },
      ],
    };

    const [speeches, total] = await Promise.all([
      prisma.speech.findMany({
        where,
        include: {
          leader: {
            select: {
              id: true,
              slug: true,
              name: true,
              country: true,
              photoUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { deliveredAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.speech.count({ where }),
    ]);

    const data = speeches.map((speech) => ({
      id: speech.id,
      slug: speech.slug,
      title: speech.title,
      deliveredAt: speech.deliveredAt.toISOString(),
      originalLang: speech.originalLang,
      venue: speech.venue,
      country: speech.country,
      leader: speech.leader,
      tags: speech.tags.map((st) => st.tag.name),
      highlight: null,
      score: 1,
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
