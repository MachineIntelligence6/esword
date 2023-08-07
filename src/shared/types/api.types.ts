import { Book } from "@prisma/client";




type ApiResCode = "SUCCEESS" | "UNKOWN_ERROR" | "SLUG_MUST_BE_UNIQUE" | "NOT_FOUND" | "VERSE_NUMBER_MUST_BE_UNIQUE"


export type ApiResponse<TData = any> = {
    succeed: boolean;
    code?: ApiResCode;
    data?: TData | null;
}


export type BasePaginationProps<TInclude = null> = {
    page?: number,
    perPage?: number;
    include?: TInclude
}


export type PaginatedApiResponse<TData = any> = ApiResponse<TData> & {
    pagination?: {
        page: number;
        perPage: number;
        results: number;
    }
}