import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { Prisma } from "@prisma/client";
import { VerseFormSchema } from "@/components/dashboard/forms/verses.form";
import { IHighlight, IVerse } from "@/shared/types/models.types";
import { VersesPaginationProps } from "@/shared/types/pagination.types";

export async function get({
  page = 1,
  perPage,
  topic = -1,
  include,
  where,
  orderBy,
}: VersesPaginationProps): Promise<PaginatedApiResponse<IVerse[]>> {
  try {
    const res = await axios.get<PaginatedApiResponse<IVerse[]>>(
      `/api/verses?page=${page}&perPage=${perPage}&topic=${topic}&include=${JSON.stringify(
        include
      )}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
    );
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function getById(
  id: number,
  include: Prisma.VerseInclude
): Promise<ApiResponse<IVerse>> {
  try {
    const res = await axios.get<ApiResponse<IVerse>>(
      `/api/verses/${id}?include=${JSON.stringify(include)}`
    );
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}

export async function create(
  data: VerseFormSchema
): Promise<ApiResponse<IVerse>> {
  try {
    const res = await axios.post<ApiResponse<IVerse>>("/api/verses", data);
    if (res.status !== 200) throw new Error();
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

export async function update(
  id: number,
  update: VerseFormSchema
): Promise<ApiResponse<IVerse>> {
  try {
    const res = await axios.put<ApiResponse<IVerse>>(
      `/api/verses/${id}`,
      update
    );
    if (res.status !== 200) throw new Error();
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

export async function updateHighlights(
  id: number,
  highlights: Array<IHighlight>
): Promise<ApiResponse> {
  try {
    const res = await axios.post<ApiResponse>(`/api/highlights`, {
      highlights:
        highlights?.map((highlight) => ({ ...highlight, id: undefined })) ?? [],
      verse: id,
    });
    if (res.status !== 200) throw new Error();
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

export async function archive(id: number): Promise<ApiResponse<null>> {
  try {
    const res = await axios.delete<ApiResponse<null>>(`/api/verses/${id}`);
    if (res.status !== 200) throw new Error();
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

export async function importFromCSV(
  file: File,
  importMode: "update" | "overwrite"
): Promise<ApiResponse<IVerse[]>> {
  try {
    console.log("import mode: ", importMode);
    const data = new FormData();
    data.append("file", file);
    const res = await axios.post<ApiResponse<IVerse[]>>(
      `/api/verses/csv?importMode=${importMode}`,
      data
    );
    if (res.status !== 200) throw new Error();
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}
