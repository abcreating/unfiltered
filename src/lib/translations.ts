import prisma from "./prisma";
import { TranslationProvider } from "@/generated/prisma";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "tr", name: "Turkish" },
  { code: "ur", name: "Urdu" },
  { code: "fa", name: "Farsi" },
  { code: "he", name: "Hebrew" },
  { code: "sw", name: "Swahili" },
  { code: "id", name: "Indonesian" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "nl", name: "Dutch" },
  { code: "ms", name: "Malay" },
];

async function translateText(text: string, targetLang: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_TRANSLATE_API_KEY is not configured");
  }

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: "text",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Translation API error: ${error}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

export async function translateSpeech(
  speechId: string,
  targetLang: string
): Promise<{ translationId: string; paragraphs: { paragraphId: string; text: string }[] }> {
  // Check if translation already exists
  const existing = await prisma.translation.findUnique({
    where: {
      speechId_lang: { speechId, lang: targetLang },
    },
    include: {
      paragraphs: {
        include: {
          paragraph: true,
        },
        orderBy: {
          paragraph: { index: "asc" },
        },
      },
    },
  });

  if (existing) {
    return {
      translationId: existing.id,
      paragraphs: existing.paragraphs.map((pt) => ({
        paragraphId: pt.paragraphId,
        text: pt.text,
      })),
    };
  }

  // Get speech paragraphs
  const speech = await prisma.speech.findUnique({
    where: { id: speechId },
    include: {
      paragraphs: {
        orderBy: { index: "asc" },
      },
    },
  });

  if (!speech) {
    throw new Error("Speech not found");
  }

  // Translate title
  const translatedTitle = await translateText(speech.title, targetLang);

  // Translate each paragraph
  const translatedParagraphs: { paragraphId: string; text: string }[] = [];

  for (const paragraph of speech.paragraphs) {
    const translatedText = await translateText(paragraph.text, targetLang);
    translatedParagraphs.push({
      paragraphId: paragraph.id,
      text: translatedText,
    });
  }

  // Save translation to DB
  const translation = await prisma.translation.create({
    data: {
      speechId,
      lang: targetLang,
      title: translatedTitle,
      provider: TranslationProvider.GOOGLE,
      paragraphs: {
        create: translatedParagraphs.map((tp) => ({
          paragraphId: tp.paragraphId,
          text: tp.text,
        })),
      },
    },
  });

  return {
    translationId: translation.id,
    paragraphs: translatedParagraphs,
  };
}
