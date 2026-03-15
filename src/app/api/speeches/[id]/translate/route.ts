import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { translateSpeech, SUPPORTED_LANGUAGES } from "@/lib/translations";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Sign in to use translations" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { lang } = body;

    if (!lang) {
      return NextResponse.json(
        { error: "Target language is required" },
        { status: 400 }
      );
    }

    const supported = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    if (!supported) {
      return NextResponse.json(
        { error: `Unsupported language: ${lang}` },
        { status: 400 }
      );
    }

    const result = await translateSpeech(params.id, lang);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Translation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
