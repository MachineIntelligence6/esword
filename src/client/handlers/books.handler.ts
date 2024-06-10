import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { BookFormSchema } from "@/components/dashboard/forms/books.form";
import { IBook } from "@/shared/types/models.types";
import { BooksPaginationProps } from "@/shared/types/pagination.types";

export async function get({
  page = 1,
  perPage,
  include,
  where,
  orderBy,
}: BooksPaginationProps): Promise<PaginatedApiResponse<IBook[]>> {
  try {
    const res = await axios.get<PaginatedApiResponse<IBook[]>>(
      `/api/books?page=${page}&perPage=${perPage}&include=${JSON.stringify(
        include
      )}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
    );
    return res.data;
  } catch (error) {
    return {
      succeed: false,
      code: "UNKOWN_ERROR",
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
      code: "UNKOWN_ERROR",
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
      code: "UNKOWN_ERROR",
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
      code: "UNKOWN_ERROR",
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
      code: "UNKOWN_ERROR",
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
      code: "UNKOWN_ERROR",
    };
  }
}
