import type {
  Speech,
  Leader,
  Paragraph,
  Translation,
  ParagraphTranslation,
  SpeechTag,
  Tag,
  MediaReport,
  AiContext,
  Bookmark,
} from "@/generated/prisma";

// ─── SPEECH TYPES ───────────────────────────────────────────

/** Speech with its associated leader (for list views) */
export type SpeechWithLeader = Speech & {
  leader: Leader;
};

/** Speech with paragraphs (for reading view) */
export type SpeechWithParagraphs = Speech & {
  paragraphs: (Paragraph & {
    translations: ParagraphTranslation[];
  })[];
};

/** Fully hydrated speech with all relations */
export type SpeechFull = Speech & {
  leader: Leader;
  paragraphs: (Paragraph & {
    translations: ParagraphTranslation[];
  })[];
  translations: Translation[];
  tags: (SpeechTag & {
    tag: Tag;
  })[];
  mediaReports: MediaReport[];
  aiContext: AiContext | null;
  bookmarks: Bookmark[];
};

// ─── LEADER TYPES ───────────────────────────────────────────

/** Leader with their speeches (for leader profile page) */
export type LeaderWithSpeeches = Leader & {
  speeches: SpeechWithLeader[];
};

// ─── SEARCH TYPES ───────────────────────────────────────────

/** Result item returned from full-text speech search */
export type SearchResult = {
  id: string;
  slug: string;
  title: string;
  deliveredAt: string;
  originalLang: string;
  venue: string | null;
  country: string | null;
  leader: {
    id: string;
    slug: string;
    name: string;
    country: string;
    photoUrl: string | null;
  };
  tags: string[];
  /** Highlighted snippet matching the query */
  highlight: string | null;
  /** Relevance score from full-text search */
  score: number;
};

/** Result item for paragraph-level (clip) search */
export type ClipSearchResult = {
  paragraphId: string;
  speechId: string;
  speechSlug: string;
  speechTitle: string;
  leaderName: string;
  leaderSlug: string;
  index: number;
  text: string;
  startTime: number | null;
  endTime: number | null;
  /** Highlighted snippet matching the query */
  highlight: string | null;
  score: number;
};

// ─── PAGINATION ─────────────────────────────────────────────

/** Generic paginated response wrapper */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
