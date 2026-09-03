import { create } from "zustand";

type SidebarStoreType = {
  sidebarActive?: boolean;
  setSidebarActive: (active: boolean) => void;
  /** Desktop rail collapsed — logo + nav labels hidden. */
  desktopCollapsed: boolean;
  setDesktopCollapsed: (collapsed: boolean) => void;
  toggleDesktopCollapsed: () => void;
};

export const useSidebarStore = create<SidebarStoreType>()((set) => ({
  sidebarActive: false,
  setSidebarActive(active) {
    set({ sidebarActive: active });
  },
  desktopCollapsed: false,
  setDesktopCollapsed(collapsed) {
    set({ desktopCollapsed: collapsed });
  },
  toggleDesktopCollapsed() {
    set((state) => ({ desktopCollapsed: !state.desktopCollapsed }));
  },
}));
