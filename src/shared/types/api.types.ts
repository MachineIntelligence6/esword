



export type ApiResCode = "SUCCESS" | "BOOKMARK_ALREADY_EXIST" | "HIGHLIGHT_ALREADY_EXIST" | "UNAUTHORIZED" | "UNKOWN_ERROR" | "FILE_NOT_FOUND" | "DATA_LINKED" | "TOPIC_NUMBER_MUST_BE_UNIQUE" | "SLUG_MUST_BE_UNIQUE" | "BOOK_NAME_MUST_BE_UNIQUE" | "NOT_FOUND" | "VERSE_NUMBER_MUST_BE_UNIQUE" | "EMAIL_ALREADY_EXISTS" | "WRONG_PASSWORD"


export type ApiResponse<TData = any> = {
    succeed: boolean;
    code?: ApiResCode;
    data?: TData | null;
}


export type BasePaginationProps<TInclude = null, TWhere = unknown, TOrderBy = unknown> = {
    page?: number,
    perPage?: number;
    include?: TInclude
    where?: TWhere
    orderBy?: TOrderBy
}



export type ApiPagination = {
    page: number;
    perPage: number;
    results: number;
    count: number;
    totalPages: number
}

export type PaginatedApiResponse<TData = any> = ApiResponse<TData> & {
    pagination?: ApiPagination
}