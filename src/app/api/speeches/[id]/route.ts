import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const speech = await prisma.speech.findUnique({
      where: { id: params.id },
      include: {
        leader: true,
        paragraphs: {
          orderBy: { index: "asc" },
          include: {
            translations: true,
          },
        },
        translations: {
          include: {
            paragraphs: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        mediaReports: {
          orderBy: { publishedAt: "desc" },
        },
        aiContext: true,
      },
    });

    if (!speech) {
      return NextResponse.json(
        { error: "Speech not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: speech });
  } catch (error) {
    console.error("Failed to fetch speech:", error);
    return NextResponse.json(
      { error: "Failed to fetch speech" },
      { status: 500 }
    );
  }
}
