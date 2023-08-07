import defaults from "@/shared/constants/defaults"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { Book } from "@prisma/client"
import axios from 'axios'




export async function getAll(page: number = 1, perPage: number = defaults.PER_PAGE_ITEMS): Promise<Book[]> {
    try {
        const res = await axios.get<PaginatedApiResponse<Book[]>>("/api/books?page=1&perPage=-1")
        if (!res.data.data) return []
        return res.data.data
    } catch (error) {
        console.log(error)
        return []
    }
}


