import { create } from "zustand";

type SidebarStoreType = {
  sidebarActive?: boolean;
  // eslint-disable-next-line no-unused-vars
  setSidebarActive: (active: boolean) => void;
};

export const useSidebarStore = create<SidebarStoreType>()((set) => ({
  sidebarActive: false,
  setSidebarActive(active) {
    set({ sidebarActive: active });
  },
}));
