import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from "@/server/db";
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IBook } from "@/shared/types/models.types";
import { BooksPaginationProps } from "@/shared/types/pagination.types";
import {
  BookExportFormat,
  ExportableBook,
  bookExportFilename,
  formatBookExport,
  getBookExportFormat,
} from "@/lib/book-export";
import { isAuthError, requireAdmin, requireContentManager } from "./authz";

export async function getAll({
  page = 1,
  perPage = defaults.PER_PAGE_ITEMS,
  include,
  where,
  orderBy,
}: BooksPaginationProps): Promise<PaginatedApiResponse<IBook[]>> {
  try {
    const books = await db.book.findMany({
      where: where
        ? {
            ...where,
            archived: where.archived ?? false,
          }
        : {
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
        ? include
        : // { ...(include.chapters && { chapters: { where: { archived: false } } }) }
          { chapters: false, _count: true },
    });
    const booksCount = await db.book.count({
      where: where
        ? {
            ...where,
            archived: where.archived ?? false,
          }
        : {
            archived: false,
          },
    });
    return {
      succeed: true,
      pagination: {
        page: page,
        perPage: perPage,
        results: books.length,
        totalPages: Math.ceil(booksCount / perPage),
        count: booksCount,
      },
      data: books,
    };
  } catch (error) {
    console.error(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function getByRef(
  ref: string,
  include?: Prisma.BookInclude
): Promise<ApiResponse<IBook>> {
  try {
    const book = await db.book.findFirst({
      where: {
        OR: [
          {
            slug: ref,
          },
          {
            id: parseInt(ref),
          },
        ],
        archived: false,
      },
      include: include
        ? include
        : // { ...(include.chapters && { chapters: { where: { archived: false } } }) }
          { chapters: false },
    });
    if (!book) {
      return {
        succeed: false,
        code: "NOT_FOUND",
        data: null,
      };
    }
    return {
      succeed: true,
      data: book,
    };
  } catch (error) {
    console.error(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function archive(id: number): Promise<ApiResponse<IBook>> {
  try {
    const session = await requireAdmin();
    if (isAuthError(session)) return session;

    const book = await db.book.findFirst({
      where: { id: id },
      include: { chapters: true },
    });
    if (book?.chapters && book.chapters.length > 0) {
      return {
        succeed: false,
        code: "DATA_LINKED",
        data: null,
      };
    }
    const deletedBook = await db.book.update({
      where: { id: id },
      data: {
        archived: true,
      },
    });
    return {
      succeed: true,
      data: deletedBook,
    };
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function archiveMany(ids: number[]): Promise<ApiResponse<any>> {
  try {
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
    console.error(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

type CreateBookReq = Prisma.BookCreateInput;

export async function create(req: Request): Promise<ApiResponse> {
  try {
    const session = await requireContentManager();
    if (isAuthError(session)) return session;
    const bookReq = (await req.json()) as CreateBookReq;
    const bookExist = await db.book.findFirst({
      where: {
        OR: [{ slug: bookReq.slug }, { name: bookReq.name.trim() }],
      },
    });
    if (bookExist) {
      return {
        succeed: false,
        code:
          bookExist.name === bookReq.name.trim()
            ? "BOOK_NAME_MUST_BE_UNIQUE"
            : "SLUG_MUST_BE_UNIQUE",
      };
    }
    const book = await db.book.create({
      data: {
        name: bookReq.name.trim(),
        slug: bookReq.slug,
        abbreviation: bookReq.abbreviation,
        priority: bookReq.priority,
      },
      include: {
        chapters: false,
      },
    });
    if (!book) throw new Error("");
    return {
      succeed: true,
      code: "SUCCESS",
      data: book,
    };
  } catch (error) {
    console.error(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

type UpdateBookReq = {
  name?: string;
  slug?: string;
  abbreviation?: string;
  archived?: boolean;
  priority?: number;
};

export type BookExportResult =
  | {
      succeed: true;
      filename: string;
      mimeType: string;
      body: string;
    }
  | {
      succeed: false;
      code: ApiResponse["code"];
    };

async function loadBookForExport(
  ref: string
): Promise<ExportableBook | null> {
  const id = Number.parseInt(ref, 10);
  const book = await db.book.findFirst({
    where: {
      OR: [{ slug: ref }, ...(Number.isFinite(id) ? [{ id }] : [])],
      archived: false,
    },
    include: {
      chapters: {
        where: { archived: false },
        orderBy: { name: "asc" },
        include: {
          topics: {
            where: { archived: false },
            orderBy: { number: "asc" },
            include: {
              verses: {
                where: { archived: false },
                orderBy: { number: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!book) return null;

  return {
    name: book.name,
    slug: book.slug,
    abbreviation: book.abbreviation,
    chapters: book.chapters.map((chapter) => ({
      name: chapter.name,
      commentaryName: chapter.commentaryName,
      topics: chapter.topics.map((topic) => ({
        number: topic.number,
        name: topic.name,
        verses: topic.verses.map((verse) => ({
          number: verse.number,
          text: verse.text,
        })),
      })),
    })),
  };
}

export async function exportByRef(
  ref: string,
  format: BookExportFormat
): Promise<BookExportResult> {
  try {
    const session = await requireContentManager();
    if (isAuthError(session)) {
      return { succeed: false, code: session.code ?? "UNAUTHORIZED" };
    }

    const book = await loadBookForExport(ref);
    if (!book) {
      return { succeed: false, code: "NOT_FOUND" };
    }

    const formatMeta = getBookExportFormat(format);
    return {
      succeed: true,
      filename: bookExportFilename(book, format),
      mimeType: formatMeta.mimeType,
      body: formatBookExport(book, format),
    };
  } catch (error) {
    console.error(error);
    return { succeed: false, code: "UNKNOWN_ERROR" };
  }
}


export async function update(req: Request, id: number): Promise<ApiResponse> {
  try {
    const session = await requireContentManager();
    if (isAuthError(session)) return session;
    const bookReq = (await req.json()) as UpdateBookReq;

    if (bookReq.slug) {
      const bookExist = await db.book.findFirst({
        where: {
          OR: [{ slug: bookReq.slug }, { name: bookReq.name?.trim() }],
        },
      });
      if (bookExist && bookExist.id !== id) {
        return {
          succeed: false,
          code:
            bookExist.name === bookReq.name
              ? "BOOK_NAME_MUST_BE_UNIQUE"
              : "SLUG_MUST_BE_UNIQUE",
        };
      }
    }
    const book = await db.book.update({
      data: {
        ...(bookReq.name && { name: bookReq.name.trim() }),
        ...(bookReq.slug && { slug: bookReq.slug }),
        ...(bookReq.abbreviation && { abbreviation: bookReq.abbreviation }),
        ...(bookReq.priority && { priority: bookReq.priority }),
      },
      where: {
        id: id,
      },
    });
    if (!book) throw new Error("");
    return {
      succeed: true,
      code: "SUCCESS",
      data: book,
    };
  } catch (error) {
    console.error(error);
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}
