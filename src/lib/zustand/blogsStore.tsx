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
  contextBookId?: number | null;
  contextChapterId?: number | null;
  contextVerseId?: number | null;
  setActiveBlog: (blog: IBlog) => void;
  loadBlogsData: (
    type: BlogType,
    page: number,
    context?: {
      bookId?: number | null;
      chapterId?: number | null;
      verseId?: number | null;
    }
  ) => Promise<void>;
};

export const useBlogsStore = create<BlogsStoreType>()((set, get) => ({
  currentPage: 1,
  setActiveBlog(blog) {
    if (blog.id === get().activeBlog?.id) return;
    set((state) => ({ ...state, activeBlog: blog }));
  },
  loadBlogsData: async (blogType, page, context) => {
    const bookId = context?.bookId ?? get().contextBookId ?? null;
    const chapterId = context?.chapterId ?? get().contextChapterId ?? null;
    const verseId = context?.verseId ?? get().contextVerseId ?? null;

    set({
      loadingBlogs: true,
      blogsList: null,
      activeBlog: null,
      currentPage: page,
      contextBookId: bookId,
      contextChapterId: chapterId,
      contextVerseId: verseId,
    });

    if (!bookId) {
      set((state) => ({
        ...state,
        loadingBlogs: false,
        blogsList: [],
        activeBlog: null,
        blogsPagination: {
          page: 1,
          perPage: 10,
          results: 0,
          totalPages: 0,
          count: 0,
        },
      }));
      return;
    }

    const { data: blogs, pagination } = await clientApiHandlers.blogs.get({
      page: page,
      perPage: 10,
      type: blogType,
      book: bookId,
      chapter: chapterId ?? -1,
      verse: verseId ?? -1,
      where: {
        status: "PUBLISHED",
        archived: false,
      },
      include: {
        book: true,
        chapter: true,
        verse: true,
      },
    });
    const firstBlog = blogs?.[0] ?? null;
    set((state) => ({
      ...state,
      loadingBlogs: false,
      blogsList: blogs ?? [],
      activeBlog: firstBlog,
      blogsPagination: pagination,
    }));
  },
}));
