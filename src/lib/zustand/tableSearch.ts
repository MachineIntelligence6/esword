import { create } from "zustand";

type TableSearchStoreType = {
  entity: string;
  searchQuery: string;
  setEntity: (entity: string) => void;
  setSearchQuery: (query: string) => void;
};

export const useTableSearchStore = create<TableSearchStoreType>()((set) => ({
  entity: "",
  searchQuery: "",
  setEntity(entity) {
    set({ entity });
  },
  setSearchQuery(query) {
    set({ searchQuery: query });
  },
}));
