import prisma from "./prisma";
import { TranslationProvider } from "@/generated/prisma";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "tr", name: "Turkish" },
  { code: "id", name: "Indonesian" },
  { code: "vi", name: "Vietnamese" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "nl", name: "Dutch" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "el", name: "Greek" },
  { code: "hu", name: "Hungarian" },
  { code: "sv", name: "Swedish" },
  { code: "ur", name: "Urdu" },
];

async function translateChunk(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
  });

  const email = process.env.MYMEMORY_EMAIL;
  if (email) {
    params.set("de", email);
  }

  const response = await fetch(
    `https://api.mymemory.translated.net/get?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || "Translation failed");
  }

  return data.responseData.translatedText;
}

async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (text.length <= 450) {
    return translateChunk(text, sourceLang, targetLang);
  }

  // Split into sentences, then group into chunks under 450 chars
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > 450 && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  const translated = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, sourceLang, targetLang))
  );

  return translated.join(" ");
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

  const sourceLang = speech.originalLang || "en";

  // Translate title
  const translatedTitle = await translateText(speech.title, sourceLang, targetLang);

  // Translate each paragraph
  const translatedParagraphs: { paragraphId: string; text: string }[] = [];

  for (const paragraph of speech.paragraphs) {
    const translatedText = await translateText(paragraph.text, sourceLang, targetLang);
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
      provider: TranslationProvider.GOOGLE, // reusing enum, means "machine translated"
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
