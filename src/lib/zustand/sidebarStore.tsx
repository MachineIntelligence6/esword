import { create } from "zustand";

type SidebarStoreType = {
  sidebarActive?: boolean;
  setSidebarActive: (active: boolean) => void;
};

export const useSidebarStore = create<SidebarStoreType>()((set) => ({
  sidebarActive: false,
  setSidebarActive(active) {
    set({ sidebarActive: active });
  },
}));
