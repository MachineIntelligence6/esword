import clientApiHandlers from "@/client/handlers";
import { ApiPagination } from "@/shared/types/api.types";
import { IBlog } from "@/shared/types/models.types";
import { BlogType } from "@prisma/client";
import { create } from "zustand";

type BlogsStoreType = {
  loadingBlogs?: boolean;
  blogsList?: Array<IBlog> | null;
  activeBlog?: IBlog | null;
  currentPage: number;
  blogsPagination?: ApiPagination;
  setActiveBlog: (blog: IBlog) => void;
  loadBlogsData: (type: BlogType, page: number) => Promise<void>;
};

export const useBlogsStore = create<BlogsStoreType>()((set, get) => ({
  currentPage: 1,
  setActiveBlog(blog) {
    if (blog.id === get().activeBlog?.id) return;
    set((state) => ({ ...state, activeBlog: blog }));
  },
  loadBlogsData: async (blogType, page) => {
    set({ loadingBlogs: true, blogsList: null, currentPage: page });
    const { data: blogs, pagination } = await clientApiHandlers.blogs.get({
      page: page,
      perPage: 10,
      where: { type: blogType },
    });
    const firstBlog = blogs?.[0];
    set((state) => ({
      ...state,
      loadingBlogs: false,
      blogsList: blogs,
      activeBlog: firstBlog,
      blogsPagination: pagination,
    }));
  },
}));
