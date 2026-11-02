import axios from "axios";
import { ApiResponse } from "@/shared/types/api.types";



export async function createCheckout(data: { amount: number, monthly: boolean }): Promise<ApiResponse<{ url: string }>> {
    try {
        const res = await axios.post<ApiResponse<{ url: string }>>('/api/donate/checkout', data)
        return res.data
    } catch (error) {
        return { succeed: false, code: "UNKNOWN_ERROR", data: null }
    }
}
