import clientApiHandlers from "@/client/handlers";
import defaults from "@/shared/constants/defaults";
import { ApiPagination } from "@/shared/types/api.types";
import { IBlog } from "@/shared/types/models.types";
import { BlogType } from "@prisma/client";
import { create } from 'zustand'






type SidebarStoreType = {
    sidebarActive?: boolean;
    setSidebarActive: (active: boolean) => void;
}


export const useSidebarStore = create<SidebarStoreType>()(
    (set, get) => ({
        sidebarActive: false,
        setSidebarActive(active) {
            set({ sidebarActive: active })
        },
    }),
)


