import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const leaderId = searchParams.get("leaderId");
    const tag = searchParams.get("tag");
    const lang = searchParams.get("lang");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");

    const where: Prisma.SpeechWhereInput = {
      status: "PUBLISHED",
    };

    if (leaderId) {
      where.leaderId = leaderId;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    if (lang) {
      where.originalLang = lang;
    }

    if (from || to) {
      where.deliveredAt = {};
      if (from) {
        where.deliveredAt.gte = new Date(from);
      }
      if (to) {
        where.deliveredAt.lte = new Date(to);
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { titleOriginal: { contains: q } },
        { occasion: { contains: q } },
      ];
    }

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
              countryCode: true,
              role: true,
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

    return NextResponse.json({
      data: speeches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch speeches:", error);
    return NextResponse.json(
      { error: "Failed to fetch speeches" },
      { status: 500 }
    );
  }
}
