import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from "@/server/db";
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { parse as csvParse } from "csv-parse/sync";
import { IVerse } from "@/shared/types/models.types";
import { VersesPaginationProps } from "@/shared/types/pagination.types";

export async function getAll({
  page = 1,
  perPage = defaults.PER_PAGE_ITEMS,
  topic = -1,
  include,
  where,
  orderBy,
}: VersesPaginationProps): Promise<PaginatedApiResponse<IVerse[]>> {
  try {
    const verses = await db.verse.findMany({
      where: where
        ? {
            ...where,
            archived: where.archived ?? false,
          }
        : {
            ...(topic !== -1 && {
              topicId: topic,
            }),
            archived: false,
          },
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
      where: where
        ? {
            ...where,
            archived: where.archived ?? false,
          }
        : {
            ...(topic !== -1 && {
              topicId: topic,
            }),
            archived: false,
          },
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
    const topic = await db.topic.findFirst({ where: { id: verseReq.topic } });
    if (!topic) throw new Error();
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
    const verseReq = (await req.json()) as UpdateVerseReq;
    if (!verseReq.chapter || !verseReq.book) throw new Error();
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

type CsvIVerse = {
  book: string;
  bookAbbr: string;
  chapter: number;
  topic: string;
  number: number;
  text: string;
};

export async function importFromCSV(
  req: Request
): Promise<ApiResponse<IVerse[]>> {
  try {
    const data = await req.formData();
    const blob = data.get("file")?.valueOf() as Blob | null;
    if (!blob)
      return {
        succeed: false,
        code: "FILE_NOT_FOUND",
      };
    const csvInputData = await blob.text();
    const csvRecords: any[] = csvParse(csvInputData, {
      delimiter: "$",
      from_line: 2,
      relaxQuotes: true,
      skip_empty_lines: true,
    });
    const csvIVerses: CsvIVerse[] = csvRecords.map((record: any[]) => ({
      book: record[0],
      bookAbbr: record[1],
      chapter: Number(record[2]),
      topic: record[3],
      number: Number(record[4]),
      text: record[5],
    }));

    const createdIVerses: IVerse[] = [];

    for (let csvIVerse of csvIVerses) {
      const book = await db.book.upsert({
        where: { name: csvIVerse.book.trim() },
        create: {
          name: csvIVerse.book.trim(),
          abbreviation: csvIVerse.bookAbbr,
          slug: csvIVerse.book.toLowerCase().replaceAll(" ", "_"),
        },
        update: {},
      });
      const chapterSlug = `${book.slug}_${csvIVerse.chapter}`;
      const chapter = await db.chapter.upsert({
        where: { slug: chapterSlug },
        create: {
          name: csvIVerse.chapter,
          slug: chapterSlug,
          bookId: book.id,
        },
        update: {},
      });
      const dbLastTopic = await db.topic.findFirst({
        orderBy: {
          number: "desc",
        },
        where: {
          chapterId: chapter.id,
        },
      });
      const topicNumber = dbLastTopic ? dbLastTopic.number + 1 : 1;
      let topic = await db.topic.findFirst({
        where: {
          OR: [{ name: csvIVerse.topic }, { number: topicNumber }],
          chapter: {
            id: chapter.id,
            bookId: chapter.bookId,
          },
        },
      });
      if (!topic || topic?.name !== csvIVerse.topic) {
        topic = await db.topic.create({
          data: {
            name: csvIVerse.topic,
            number:
              topic?.number === topicNumber ? topicNumber + 1 : topicNumber,
            chapterId: chapter.id,
          },
        });
      }
      let verse = await db.verse.findFirst({
        where: {
          number: csvIVerse.number,
          topic: {
            id: topic.id,
            chapter: {
              id: chapter.id,
              bookId: chapter.bookId,
            },
          },
        },
      });
      if (!verse) {
        verse = await db.verse.create({
          data: {
            number: csvIVerse.number,
            text: csvIVerse.text,
            topicId: topic.id,
          },
        });
        createdIVerses.push(verse);
      }
    }
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
