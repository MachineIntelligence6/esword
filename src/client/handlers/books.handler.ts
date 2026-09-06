import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { BookFormSchema } from "@/components/dashboard/forms/books.form";
import { IBook } from "@/shared/types/models.types";
import { BooksPaginationProps } from "@/shared/types/pagination.types";
import { buildApiQuery } from "@/client/query-string";
import {
  BookExportFormat,
  bookExportFilename,
  getBookExportFormat,
} from "@/lib/book-export";

export async function get({
  page = 1,
  perPage,
  include,
  where,
  orderBy,
}: BooksPaginationProps): Promise<PaginatedApiResponse<IBook[]>> {
  try {
    const res = await axios.get<PaginatedApiResponse<IBook[]>>(
      `/api/books${buildApiQuery({ page, perPage, include, where, orderBy })}`
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

export async function getById(id: number): Promise<ApiResponse<IBook>> {
  try {
    const res = await axios.get<ApiResponse<IBook>>(`/api/books/${id}`);
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
  data: BookFormSchema
): Promise<ApiResponse<IBook>> {
  try {
    const res = await axios.post<ApiResponse<IBook>>("/api/books", data);
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
  update: BookFormSchema
): Promise<ApiResponse<IBook>> {
  try {
    const res = await axios.put<ApiResponse<IBook>>(`/api/books/${id}`, update);
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
    const res = await axios.delete<ApiResponse<null>>(`/api/books/${id}`);
    if (res.status !== 200) throw new Error();
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
    };
  }
}

export async function restore(id: number): Promise<ApiResponse<null>> {
  try {
    const res = await axios.put<ApiResponse<null>>(`/api/books/${id}`, {
      archived: false,
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

export async function exportBook(
  book: Pick<IBook, "id" | "slug">,
  format: BookExportFormat
): Promise<ApiResponse<null>> {
  try {
    const res = await axios.get<string>(
      `/api/books/${book.id}/export?format=${format}`,
      { responseType: "text" }
    );
    if (res.status !== 200) throw new Error();

    const blob = new Blob([res.data], {
      type: getBookExportFormat(format).mimeType,
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = bookExportFilename(book, format);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    return { succeed: true, data: null };
  } catch (error) {
    return {
      succeed: false,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }
}
