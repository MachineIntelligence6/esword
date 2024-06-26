import axios from "axios";
import { PaginatedApiResponse } from "@/shared/types/api.types";
import { IVerse } from "@/shared/types/models.types";
import { SearchPaginationProps } from "@/shared/types/pagination.types";
import defaults from "@/shared/constants/defaults";



export async function findAll({ query, page = 1, perPage = defaults.PER_PAGE_ITEMS }: SearchPaginationProps): Promise<PaginatedApiResponse<IVerse[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IVerse[]>>(
            `/api/search?query=${query}&page=${page}&perPage=${perPage}`
        )
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}

