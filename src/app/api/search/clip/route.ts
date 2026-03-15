import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ClipSearchBody {
  query: string;
  page?: number;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClipSearchBody;
    const { query, page: rawPage, limit: rawLimit } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const page = Math.max(1, rawPage || 1);
    const limit = Math.min(50, Math.max(1, rawLimit || 10));

    // Find matching paragraphs in published speeches
    const matchingParagraphs = await prisma.paragraph.findMany({
      where: {
        text: { contains: query, mode: "insensitive" as const },
        speech: { status: "PUBLISHED" },
      },
      include: {
        speech: {
          select: {
            id: true,
            slug: true,
            title: true,
            deliveredAt: true,
            leader: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { speech: { deliveredAt: "desc" } },
        { index: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.paragraph.count({
      where: {
        text: { contains: query, mode: "insensitive" as const },
        speech: { status: "PUBLISHED" },
      },
    });

    // For each matching paragraph, fetch surrounding context (2 before, 2 after)
    const results = await Promise.all(
      matchingParagraphs.map(async (paragraph) => {
        const contextParagraphs = await prisma.paragraph.findMany({
          where: {
            speechId: paragraph.speechId,
            index: {
              gte: Math.max(0, paragraph.index - 2),
              lte: paragraph.index + 2,
            },
          },
          orderBy: { index: "asc" },
          select: {
            id: true,
            index: true,
            text: true,
            startTime: true,
            endTime: true,
            speakerLabel: true,
          },
        });

        return {
          paragraphId: paragraph.id,
          speechId: paragraph.speech.id,
          speechSlug: paragraph.speech.slug,
          speechTitle: paragraph.speech.title,
          deliveredAt: paragraph.speech.deliveredAt.toISOString(),
          leaderName: paragraph.speech.leader.name,
          leaderSlug: paragraph.speech.leader.slug,
          matchedParagraph: {
            id: paragraph.id,
            index: paragraph.index,
            text: paragraph.text,
            startTime: paragraph.startTime,
            endTime: paragraph.endTime,
            speakerLabel: paragraph.speakerLabel,
          },
          context: contextParagraphs,
        };
      })
    );

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Clip search failed:", error);
    return NextResponse.json(
      { error: "Clip search failed" },
      { status: 500 }
    );
  }
}
