import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { IBook, IChapter } from "@/shared/types/models.types";

// The URL (?book=slug&chapter=N) says what is open, so back/forward and a
// refresh land on the same chapter. On the reader page this opens the chapter
// directly (no page reload, no wait for a router re-render) and the History
// API updates the URL; SiteSidebar's URL effect then finds it already open.
// From other pages (search, problems, ...) the router navigates to the reader
// client-side.
export default function useOpenInReader() {
  const pathname = usePathname();
  const router = useRouter();
  const navigateTo = useReadBookStore((state) => state.navigateTo);
  return useCallback(
    (book: Pick<IBook, "slug">, chapter?: Pick<IChapter, "name">) => {
      const params = new URLSearchParams({ book: book.slug });
      if (chapter) params.set("chapter", String(chapter.name));
      const url = `/?${params.toString()}`;
      if (pathname !== "/") return router.push(url);
      navigateTo(book.slug, chapter?.name);
      if (window.location.search !== `?${params.toString()}`) {
        window.history.pushState(null, "", url);
      }
    },
    [pathname, router, navigateTo]
  );
}
