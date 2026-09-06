export type BookExportFormat = "remedies" | "csv" | "json";

export type ExportableVerse = {
  number: number;
  text: string;
};

export type ExportableTopic = {
  number: number;
  name: string;
  verses: ExportableVerse[];
};

export type ExportableChapter = {
  name: number;
  commentaryName?: string | null;
  topics: ExportableTopic[];
};

export type ExportableBook = {
  name: string;
  slug: string;
  abbreviation: string;
  chapters: ExportableChapter[];
};

export const BOOK_EXPORT_FORMATS: ReadonlyArray<{
  id: BookExportFormat;
  label: string;
  extension: string;
  mimeType: string;
}> = [
  {
    id: "remedies",
    label: "Remedies text (.txt)",
    extension: "txt",
    mimeType: "text/plain; charset=utf-8",
  },
  {
    id: "csv",
    label: "Import CSV (.csv)",
    extension: "csv",
    mimeType: "text/csv; charset=utf-8",
  },
  {
    id: "json",
    label: "JSON (.json)",
    extension: "json",
    mimeType: "application/json; charset=utf-8",
  },
] as const;

const PLACEHOLDER_TOPIC_RE = /^Chapter\s+\d+$/i;
const CHAPTER_BREAK_LINE_RE = /^\s*CHAPTER\s+BREAK\b.*$/gim;

export function isBookExportFormat(value: string): value is BookExportFormat {
  return BOOK_EXPORT_FORMATS.some((format) => format.id === value);
}

export function getBookExportFormat(format: BookExportFormat) {
  return BOOK_EXPORT_FORMATS.find((item) => item.id === format)!;
}

function stripChapterBreakText(text: string): string {
  return text.replace(CHAPTER_BREAK_LINE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}

function chapterTitle(chapter: ExportableChapter): string {
  const title = chapter.commentaryName?.trim();
  return title ? title : "[REVIEW REQUIRED]";
}

function shouldEmitSection(
  topic: ExportableTopic,
  chapter: ExportableChapter
): boolean {
  const name = topic.name?.trim();
  if (!name) return false;
  if (PLACEHOLDER_TOPIC_RE.test(name)) return false;
  const title = chapter.commentaryName?.trim();
  if (title && name === title) return false;
  return true;
}

export function formatBookAsRemediesText(book: ExportableBook): string {
  const blocks: string[] = [];

  for (const chapter of book.chapters) {
    const lines: string[] = [
      `CHAPTER: ${chapter.name}`,
      `TITLE: ${chapterTitle(chapter)}`,
    ];

    for (const topic of chapter.topics) {
      if (shouldEmitSection(topic, chapter)) {
        lines.push("", `SECTION: ${topic.name.trim()}`);
      }

      for (const verse of topic.verses) {
        const text = stripChapterBreakText(verse.text ?? "");
        if (!text) continue;
        lines.push("", `VERSE: ${verse.number}`, text);
      }
    }

    blocks.push(lines.join("\n"));
  }

  return `${blocks.join("\n\n")}\n`;
}

function escapeCsvField(value: string): string {
  return value.replaceAll("$", " ");
}

export function formatBookAsCsv(book: ExportableBook): string {
  const rows = ["Book$Abbreviation$Chapter$Topic$Verse$Text"];

  for (const chapter of book.chapters) {
    for (const topic of chapter.topics) {
      const topicName = topic.name?.trim() || `Chapter ${chapter.name}`;
      for (const verse of topic.verses) {
        const text = stripChapterBreakText(verse.text ?? "");
        if (!text) continue;
        rows.push(
          [
            escapeCsvField(book.name),
            escapeCsvField(book.abbreviation),
            String(chapter.name),
            escapeCsvField(topicName),
            String(verse.number),
            escapeCsvField(text),
          ].join("$")
        );
      }
    }
  }

  return `${rows.join("\n")}\n`;
}

export function formatBookAsJson(book: ExportableBook): string {
  return `${JSON.stringify(
    {
      formatVersion: 1,
      book: {
        name: book.name,
        slug: book.slug,
        abbreviation: book.abbreviation,
      },
      chapters: book.chapters.map((chapter) => ({
        number: chapter.name,
        title: chapter.commentaryName?.trim() || null,
        topics: chapter.topics.map((topic) => ({
          number: topic.number,
          name: topic.name,
          verses: topic.verses.map((verse) => ({
            number: verse.number,
            text: stripChapterBreakText(verse.text ?? ""),
          })),
        })),
      })),
    },
    null,
    2
  )}\n`;
}

export function formatBookExport(
  book: ExportableBook,
  format: BookExportFormat
): string {
  switch (format) {
    case "remedies":
      return formatBookAsRemediesText(book);
    case "csv":
      return formatBookAsCsv(book);
    case "json":
      return formatBookAsJson(book);
  }
}

export function bookExportFilename(
  book: Pick<ExportableBook, "slug">,
  format: BookExportFormat
): string {
  const { extension } = getBookExportFormat(format);
  const suffix = format === "remedies" ? "remedies" : format;
  return `${book.slug}-${suffix}.${extension}`;
}
