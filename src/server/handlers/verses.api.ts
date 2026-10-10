import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db, { logActivity, withoutActivityLog } from "@/server/db";
import { describeImport } from "@/server/activity-log";
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { parse as csvParse } from "csv-parse/sync";
import { IVerse } from "@/shared/types/models.types";
import { VersesPaginationProps } from "@/shared/types/pagination.types";
import { deleteBooks } from "./archives.api";
import { isAuthError, requireAdmin, requireContentManager } from "./authz";

export async function getAll({
  page = 1,
  perPage = defaults.PER_PAGE_ITEMS,
  topic = -1,
  include,
  where,
  orderBy,
}: VersesPaginationProps): Promise<PaginatedApiResponse<IVerse[]>> {
  try {
    const verseWhere: Prisma.VerseWhereInput = {
      ...(where ?? {}),
      ...(topic !== -1 && { topicId: topic }),
      archived: where?.archived ?? false,
    };
    const verses = await db.verse.findMany({
      where: verseWhere,
      orderBy: orderBy
        ? orderBy
        : {
            id: "asc",
          },
      ...(perPage !== -1 && {
        take: perPage,
        skip: page <= 1 ? 0 : (page - 1) * perPage,
      }),
      include: include
        ? {
            ...include,
            // ...(include.notes && { notes: { where: { archived: false } } }),
            // ...(include.commentaries && { commentaries: { where: { archived: false } } }),
          }
        : {
            topic: false,
            notes: false,
            commentaries: false,
          },
    });
    const versesCount = await db.verse.count({
      where: verseWhere,
    });
    return {
      succeed: true,
      pagination: {
        page: page,
        perPage: perPage,
        results: verses.length,
        totalPages: Math.ceil(versesCount / perPage),
        count: versesCount,
      },
      data: verses,
    };
  } catch (error) {
    console.log(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function getById(
  id: number,
  include?: Prisma.VerseInclude
): Promise<ApiResponse<IVerse>> {
  try {
    const verse = await db.verse.findFirst({
      where: {
        id: id,
        archived: false,
      },
      include: include
        ? {
            ...include,
          }
        : {
            topic: false,
            notes: false,
            commentaries: false,
          },
    });
    if (!verse) {
      return {
        succeed: false,
        code: "NOT_FOUND",
        data: null,
      };
    }
    return {
      succeed: true,
      data: verse,
    };
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function archive(id: number): Promise<ApiResponse<null>> {
  try {
    const session = await requireAdmin();
    if (isAuthError(session)) return session;
    const verse = await db.verse.update({
      where: { id: id },
      data: {
        archived: true,
      },
    });
    await db.commentary.updateMany({
      where: { verseId: verse.id },
      data: {
        archived: true,
      },
    });
    await db.note.updateMany({
      where: { verseId: verse.id },
      data: {
        archived: true,
      },
    });
    return {
      succeed: true,
      data: null,
    };
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function archiveMany(req: Request): Promise<ApiResponse<any>> {
  try {
    const session = await requireAdmin();
    if (isAuthError(session)) return session;
    const { ids } = (await req.json()) as { ids: number[] };
    if (!ids) throw new Error();
    let succeeded = 0;
    let failed = 0;

    for (let id of ids) {
      const res = await archive(id);
      if (res.succeed && res.data) succeeded += 1;
      else failed += 1;
    }

    return {
      succeed: true,
      data: {
        succeeded,
        failed,
      },
    };
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

type CreateVerseReq = {
  number: number;
  text: string;
  topic: number;
  chapter: number;
  book: number;
};

export async function create(req: Request): Promise<ApiResponse<IVerse>> {
  try {
    const session = await requireContentManager();
    if (isAuthError(session)) return session;
    const verseReq = (await req.json()) as CreateVerseReq;
    if (!verseReq.chapter || !verseReq.book || !verseReq.topic)
      throw new Error();
    const verseExist = await db.verse.findFirst({
      where: {
        topic: {
          chapter: {
            id: verseReq.chapter,
            bookId: verseReq.book,
          },
        },
        number: verseReq.number,
      },
    });
    if (verseExist) {
      return {
        succeed: false,
        code: "VERSE_NUMBER_MUST_BE_UNIQUE",
      };
    }
    const topic = await db.topic.findFirst({
      where: { id: verseReq.topic },
      include: { chapter: true },
    });
    if (
      !topic ||
      topic.chapterId !== verseReq.chapter ||
      topic.chapter.bookId !== verseReq.book
    ) {
      throw new Error();
    }
    const verse = await db.verse.create({
      data: {
        number: verseReq.number,
        text: verseReq.text,
        topicId: verseReq.topic,
        // slug: `${chapter.slug}_${verseReq.number}`
      },
      include: {
        notes: false,
        topic: false,
        commentaries: false,
      },
    });
    if (!verse) throw new Error("");
    return {
      succeed: true,
      code: "SUCCESS",
      data: verse,
    };
  } catch (error) {
    console.log(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

type UpdateVerseReq = {
  number?: number;
  text?: string;
  topic?: number;
  chapter: number;
  book: number;
};

export async function update(
  req: Request,
  id: number
): Promise<ApiResponse<IVerse>> {
  try {
    const session = await requireContentManager();
    if (isAuthError(session)) return session;
    const verseReq = (await req.json()) as UpdateVerseReq;
    if (!verseReq.chapter || !verseReq.book) throw new Error();
    const targetTopicId = verseReq.topic;
    if (targetTopicId) {
      const topic = await db.topic.findFirst({
        where: { id: targetTopicId },
        include: { chapter: true },
      });
      if (
        !topic ||
        topic.chapterId !== verseReq.chapter ||
        topic.chapter.bookId !== verseReq.book
      ) {
        throw new Error();
      }
    } else {
      const chapter = await db.chapter.findFirst({
        where: { id: verseReq.chapter },
      });
      if (!chapter || chapter.bookId !== verseReq.book) throw new Error();
    }
    if (verseReq.number) {
      const verseExist = await db.verse.findFirst({
        where: {
          id: { not: id },
          topic: {
            chapter: {
              id: verseReq.chapter,
              bookId: verseReq.book,
            },
          },
          number: verseReq.number,
        },
      });
      if (verseExist && verseExist.id !== id) {
        return {
          succeed: false,
          code: "VERSE_NUMBER_MUST_BE_UNIQUE",
        };
      }
    }
    const verse = await db.verse.update({
      data: {
        ...(verseReq.number && { number: verseReq.number }),
        ...(verseReq.text && { text: verseReq.text }),
        ...(verseReq.topic && { topicId: verseReq.topic }),
      },
      where: {
        id: id,
      },
    });
    if (!verse) throw new Error("");
    return {
      succeed: true,
      code: "SUCCESS",
      data: verse,
    };
  } catch (error) {
    console.log(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

// Chapter cells are normally numbers. The Psalms file uses the Hebrew/alef symbol
// (ℵ / א) for the introduction, which is stored as chapter 0.
const ALEF_CHARS = new Set(["\u2135", "\u05D0"]);

function parseCsvChapter(raw: string | undefined): number | null {
  const value = (raw ?? "").trim();
  if (/^\d+$/.test(value)) return Number(value);
  if (ALEF_CHARS.has(value)) return 0;
  return null;
}

type CsvIVerse = {
  book: string;
  bookAbbr: string;
  chapter: number;
  topic: string;
  number: number;
  text: string;
};

// export async function importFromCSV(
//   req: Request
// ): Promise<ApiResponse<IVerse[]>> {
//   try {
//     const data = await req.formData();
//     const queryParameters = new URLSearchParams(req.url.split("?")[1]);
//     const importMode = queryParameters.get("importMode") as
//       | "update"
//       | "overwrite";

//     const blob = data.get("file")?.valueOf() as Blob | null;
//     if (!blob)
//       return {
//         succeed: false,
//         code: "FILE_NOT_FOUND",
//       };
//     const csvInputData = await blob.text();
//     const csvRecords: any[] = csvParse(csvInputData, {
//       delimiter: "$",
//       from_line: 2,
//       relaxQuotes: true,
//       skip_empty_lines: true,
//     });
//     const csvIVerses: CsvIVerse[] = csvRecords.map((record: any[]) => ({
//       book: record[0],
//       bookAbbr: record[1],
//       chapter: Number(record[2]),
//       topic: record[3],
//       number: Number(record[4]),
//       text: record[5],
//     }));

//     const createdIVerses: IVerse[] = [];

//     // for (let csvIVerse of csvIVerses) {
//     //   const book = await db.book.upsert({
//     //     where: { name: csvIVerse.book.trim() },
//     //     create: {
//     //       name: csvIVerse.book.trim(),
//     //       abbreviation: csvIVerse.bookAbbr,
//     //       slug: csvIVerse.book.toLowerCase().replaceAll(" ", "_"),
//     //     },
//     //     update: {},
//     //   });
//     //   const chapterSlug = `${book.slug}_${csvIVerse.chapter}`;
//     //   const chapter = await db.chapter.upsert({
//     //     where: { slug: chapterSlug },
//     //     create: {
//     //       name: csvIVerse.chapter,
//     //       slug: chapterSlug,
//     //       bookId: book.id,
//     //     },
//     //     update: {},
//     //   });
//     //   const dbLastTopic = await db.topic.findFirst({
//     //     orderBy: {
//     //       number: "desc",
//     //     },
//     //     where: {
//     //       chapterId: chapter.id,
//     //     },
//     //   });
//     //   const topicNumber = dbLastTopic ? dbLastTopic.number + 1 : 1;
//     //   let topic = await db.topic.findFirst({
//     //     where: {
//     //       OR: [{ name: csvIVerse.topic }, { number: topicNumber }],
//     //       chapter: {
//     //         id: chapter.id,
//     //         bookId: chapter.bookId,
//     //       },
//     //     },
//     //   });
//     //   if (!topic || topic?.name !== csvIVerse.topic) {
//     //     topic = await db.topic.create({
//     //       data: {
//     //         name: csvIVerse.topic,
//     //         number:
//     //           topic?.number === topicNumber ? topicNumber + 1 : topicNumber,
//     //         chapterId: chapter.id,
//     //       },
//     //     });
//     //   }
//     //   let verse = await db.verse.findFirst({
//     //     where: {
//     //       number: csvIVerse.number,
//     //       topic: {
//     //         id: topic.id,
//     //         chapter: {
//     //           id: chapter.id,
//     //           bookId: chapter.bookId,
//     //         },
//     //       },
//     //     },
//     //   });
//     //   if (!verse) {
//     //     verse = await db.verse.create({
//     //       data: {
//     //         number: csvIVerse.number,
//     //         text: csvIVerse.text,
//     //         topicId: topic.id,
//     //       },
//     //     });
//     //     createdIVerses.push(verse);
//     //   }
//     // }
//     if (importMode === "overwrite") {
//       console.log("Overwrite mode");
//     }else if (importMode === "update") {
//       console.log("Update mode");
//     }

//     return {
//       succeed: true,
//       code: "SUCCESS",
//       data: createdIVerses,
//     };
//   } catch (error) {
//     console.log(error);
//   }
//   return {
//     succeed: false,
//     code: "UNKNOWN_ERROR",
//   };
// }

export async function importFromCSV(
  req: Request
): Promise<ApiResponse<IVerse[]>> {
  try {
    const session = await requireAdmin();
    if (isAuthError(session)) return session;
    const data = await req.formData();
    const queryParameters = new URLSearchParams(req.url.split("?")[1]);
    const importMode = queryParameters.get("importMode") as
      | "update"
      | "overwrite";

    const blob = data.get("file")?.valueOf() as Blob | null;
    if (!blob)
      return {
        succeed: false,
        code: "FILE_NOT_FOUND",
      };
    // Strip a UTF-8 BOM and normalise so Hebrew/Unicode text is stored consistently.
    const csvInputData = (await blob.text()).replace(/^\uFEFF/, "").normalize("NFC");
    const csvRecords: string[][] = csvParse(csvInputData, {
      delimiter: "$",
      relaxQuotes: true,
      relaxColumnCount: true,
      skip_empty_lines: true,
    });
    // The first row is a header ("BOOK$ABBREVIATION$..."), possibly with a stray leading "$".
    const rows = csvRecords.slice(1).map((record, i) => ({
      record: record.length > 6 && record[0] === "" ? record.slice(1) : record,
      line: i + 2,
    }));

    const rowErrors: string[] = [];
    const csvIVerses: CsvIVerse[] = [];
    for (const { record, line } of rows) {
      const chapter = parseCsvChapter(record[2]);
      const number = Number(record[4]?.trim());
      if (chapter === null || !Number.isInteger(number) || !record[0]?.trim()) {
        rowErrors.push(`line ${line}: chapter "${record[2]}", verse "${record[4]}"`);
        continue;
      }
      csvIVerses.push({
        book: record[0].trim(),
        bookAbbr: record[1]?.trim() ?? "",
        chapter,
        topic: record[3]?.trim() ?? "",
        number,
        text: record[5] ?? "",
      });
    }
    // Reject before touching the database (overwrite mode deletes books first).
    if (rowErrors.length > 0) {
      console.error(`CSV import rejected, ${rowErrors.length} bad rows:`, rowErrors.slice(0, 20));
      return { succeed: false, code: "VALIDATION_ERROR", data: null };
    }

    if (importMode !== "overwrite" && importMode !== "update") {
      return { succeed: false, code: "VALIDATION_ERROR" };
    }

    // One summary line in the activity log instead of an entry per book,
    // chapter, topic and verse batch the import writes.
    const { bookCache, createdCount, updatedCount } = await withoutActivityLog(async () => {
      if (importMode === "overwrite") {
        const books = await db.book.findMany({
          where: { name: { in: Array.from(new Set(csvIVerses.map((v) => v.book))) } },
        });
        await deleteBooks(books.map((book) => book.id));
      }

      // Resolve books, chapters and topics once each (not once per verse), then
      // write verses in batches. A per-row version took ~2.5 min for 3,000 rows,
      // longer than proxy timeouts allow.
      const bookCache = new Map<string, { id: number; slug: string }>();
      const chapterCache = new Map<string, number>();
      const topicCache = new Map<string, number>(); // `${chapterId}|${name}` -> topic id
      const nextTopicNumber = new Map<number, number>(); // chapterId -> next number
      const wanted = new Map<string, { topicId: number; number: number; text: string }>();

      for (const row of csvIVerses) {
        let book = bookCache.get(row.book);
        if (!book) {
          book = await db.book.upsert({
            where: { name: row.book },
            create: {
              name: row.book,
              abbreviation: row.bookAbbr,
              slug: row.book.toLowerCase().replaceAll(" ", "_"),
            },
            update: {},
          });
          bookCache.set(row.book, book);
        }
        const chapterSlug = `${book.slug}_${row.chapter}`;
        let chapterId = chapterCache.get(chapterSlug);
        if (chapterId === undefined) {
          const chapter = await db.chapter.upsert({
            where: { slug: chapterSlug },
            create: { name: row.chapter, slug: chapterSlug, bookId: book.id },
            update: {},
          });
          chapterId = chapter.id;
          chapterCache.set(chapterSlug, chapterId);
          const topics = await db.topic.findMany({ where: { chapterId } });
          let max = 0;
          for (const t of topics) {
            max = Math.max(max, t.number);
            if (!topicCache.has(`${chapterId}|${t.name}`)) {
              topicCache.set(`${chapterId}|${t.name}`, t.id);
            }
          }
          nextTopicNumber.set(chapterId, max + 1);
        }
        const topicKey = `${chapterId}|${row.topic}`;
        let topicId = topicCache.get(topicKey);
        if (topicId === undefined) {
          const number = nextTopicNumber.get(chapterId)!;
          const topic = await db.topic.create({
            data: { name: row.topic, number, chapterId },
          });
          nextTopicNumber.set(chapterId, number + 1);
          topicId = topic.id;
          topicCache.set(topicKey, topicId);
        }
        // Duplicate rows for the same topic+verse: first occurrence wins in
        // overwrite mode, last wins in update mode (matches the old behaviour).
        const key = `${topicId}|${row.number}`;
        if (importMode === "update" || !wanted.has(key)) {
          wanted.set(key, { topicId, number: row.number, text: row.text });
        }
      }

      const topicIds = Array.from(new Set(Array.from(wanted.values()).map((v) => v.topicId)));
      const existing = new Map<string, { id: number; text: string }>();
      for (let i = 0; i < topicIds.length; i += 500) {
        const found = await db.verse.findMany({
          where: { topicId: { in: topicIds.slice(i, i + 500) } },
          select: { id: true, topicId: true, number: true, text: true },
        });
        for (const v of found) {
          const key = `${v.topicId}|${v.number}`;
          if (!existing.has(key)) existing.set(key, { id: v.id, text: v.text });
        }
      }

      const toCreate: { topicId: number; number: number; text: string }[] = [];
      const toUpdate: { id: number; text: string }[] = [];
      wanted.forEach((v, key) => {
        const old = existing.get(key);
        if (!old) toCreate.push(v);
        else if (importMode === "update" && old.text !== v.text) {
          toUpdate.push({ id: old.id, text: v.text });
        }
      });
      for (let i = 0; i < toCreate.length; i += 500) {
        await db.verse.createMany({ data: toCreate.slice(i, i + 500) });
      }
      for (let i = 0; i < toUpdate.length; i += 50) {
        await Promise.all(
          toUpdate
            .slice(i, i + 50)
            .map((v) => db.verse.update({ where: { id: v.id }, data: { text: v.text } }))
        );
      }
      return { bookCache, createdCount: toCreate.length, updatedCount: toUpdate.length };
    });
    if (createdCount + updatedCount > 0) {
      const books = Array.from(bookCache.entries());
      await logActivity({
        action: createdCount > 0 ? "CREATE" : "UPDATE",
        model: "BOOKS",
        description: (userName) =>
          describeImport(userName, books.map(([name]) => name), createdCount, updatedCount),
        ref: books.length === 1 ? books[0][1].id : null,
      });
    }
    const createdIVerses: IVerse[] = [];
    console.log(`CSV import (${importMode}): ${createdCount} created, ${updatedCount} updated`);

    return {
      succeed: true,
      code: "SUCCESS",
      data: createdIVerses,
    };
  } catch (error) {
    console.log(error);
  }
  return {
    succeed: false,
    code: "UNKNOWN_ERROR",
  };
}
