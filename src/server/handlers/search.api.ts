import { PaginatedApiResponse } from "@/shared/types/api.types";
import db from "@/server/db";
import defaults from "@/shared/constants/defaults";
import { IVerse } from "@/shared/types/models.types";
import { SearchPaginationProps } from "@/shared/types/pagination.types";

export async function findAll({
  page = 1,
  perPage = defaults.PER_PAGE_ITEMS,
  query,
}: SearchPaginationProps): Promise<PaginatedApiResponse<IVerse[]>> {
  try {
    const verses = await db.verse.findMany({
      where: {
        archived: false,
        text: {
          // search: query.split(" ").map((s) => `${s}`).join(" ")
          contains: query,
        },
      },
      // orderBy: {
      //     _relevance: {
      //         fields: ["text"],
      //         search: query,
      //         sort: "desc"
      //     },
      // },
      ...(perPage !== -1 && {
        take: perPage,
        skip: page <= 1 ? 0 : (page - 1) * perPage,
      }),
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    });
    const versesCount = await db.verse.count({ where: { archived: false } });
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
