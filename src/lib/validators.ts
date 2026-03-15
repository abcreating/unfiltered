import { z } from "zod";

// ─── SPEECH ─────────────────────────────────────────────────

export const speechCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  titleOriginal: z.string().max(500).optional(),
  leaderId: z.string().min(1, "Leader is required"),
  originalLang: z.string().min(2).max(10),
  deliveredAt: z.string().datetime({ message: "Invalid date" }),
  venue: z.string().max(300).optional(),
  city: z.string().max(200).optional(),
  country: z.string().max(200).optional(),
  countryCode: z.string().length(2).optional(),
  occasion: z.string().max(300).optional(),
  duration: z.number().int().positive().optional(),
  videoUrl: z.string().url().optional(),
  videoSource: z.string().max(100).optional(),
  videoEmbedId: z.string().max(200).optional(),
  sourceUrl: z.string().url("Source URL is required"),
  sourceLabel: z.string().max(200).optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
  paragraphs: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        text: z.string().min(1),
        startTime: z.number().nonnegative().optional(),
        endTime: z.number().nonnegative().optional(),
        speakerLabel: z.string().max(200).optional(),
      })
    )
    .optional(),
});

export const speechUpdateSchema = speechCreateSchema.partial();

export type SpeechCreateInput = z.infer<typeof speechCreateSchema>;
export type SpeechUpdateInput = z.infer<typeof speechUpdateSchema>;

// ─── LEADER ─────────────────────────────────────────────────

export const leaderCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(300),
  nameLocal: z.string().max(300).optional(),
  country: z.string().min(1, "Country is required").max(200),
  countryCode: z.string().length(2, "Must be a 2-letter country code"),
  organization: z.string().max(300).optional(),
  role: z.string().min(1, "Role is required").max(200),
  roleStart: z.string().datetime().optional(),
  roleEnd: z.string().datetime().optional(),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(5000).optional(),
  languages: z.array(z.string().min(2).max(10)).optional(),
});

export type LeaderCreateInput = z.infer<typeof leaderCreateSchema>;

// ─── SEARCH ─────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").max(500),
  lang: z.string().min(2).max(10).optional(),
  country: z.string().max(200).optional(),
  leaderId: z.string().optional(),
  tag: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["relevance", "date", "title"]).default("relevance"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// ─── CLIP SEARCH ────────────────────────────────────────────

export const clipSearchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(500),
  lang: z.string().min(2).max(10).optional(),
  leaderId: z.string().optional(),
  speechId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type ClipSearchQuery = z.infer<typeof clipSearchSchema>;
