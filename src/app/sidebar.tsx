"use client";
import {
  BooksLoadingPlaceholder,
  ChaptersLoadingPlaceholder,
} from "@/components/loading-placeholders";
import { SideBarEl } from "@/components/ui/select";
import { TooltipEl } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { IBook, IChapter } from "@/shared/types/models.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

// The URL (?book=slug&chapter=N) says what is open, so back/forward and a
// refresh land on the same chapter. On the reader page a click opens the
// chapter directly (no page reload, no wait for a router re-render) and the
// History API updates the URL; the URL effect below then finds it already
// open. From other pages (search, problems, ...) the router navigates to the
// reader client-side.
function useOpenInReader() {
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

export default function SiteSidebar() {
  const searchParams = useSearchParams();
  const navigateTo = useReadBookStore((state) => state.navigateTo);

  useEffect(() => {
    const book = searchParams.get("book") ?? undefined;
    const chapter = parseInt(searchParams.get("chapter") ?? "");
    const verse = parseInt(searchParams.get("verse") ?? "");
    navigateTo(
      book,
      Number.isNaN(chapter) ? undefined : chapter,
      Number.isNaN(verse) ? undefined : verse
    );
  }, [searchParams, navigateTo]);

  // useEffect(() => {
  //     if (booksList && chaptersList) return;
  //     doInitialLoadWork()
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  return (
    <div className="flex lg:my-0 my-1 gap-x-3 lg:gap-x-0 bg-white w-full lg:h-full lg:px-0 px-3">
      <SidebarBooksComponent />
      <SidebarChaptersComponent />
    </div>
    // <div className="flex lg:my-0 my-1 gap-x-3 lg:gap-x-0 resize-x bg-white lg:max-w-[186px] lg:min-w-[186px] w-full lg:px-0 px-3">
    //     <SidebarBooksComponent />
    //     <SidebarChaptersComponent />
    // </div>
  );
}

export const sortByPriority = (a: IBook, b: IBook) => {
  if (a.priority === 0) return 1;
  if (b.priority === 0) return -1;
  return a.priority - b.priority;
};


function SidebarBooksComponent() {
  const { booksList, activeBook } = useReadBookStore();
  const booksListSorted = booksList?.sort(sortByPriority);
  const openInReader = useOpenInReader();

  const changeBook = (book: IBook) => openInReader(book);
  return (
    // <div className="lg:min-w-[130px] lg:max-w-[130px] w-full lg:border-0 lg:border-r-2 border border-solid text-primary-dark lg:rounded-none rounded-lg">
    <div className="lg:min-w-[130px] w-full lg:flex lg:flex-col lg:h-full lg:min-h-0 lg:border-0 lg:border-r-2 border border-solid text-primary-dark lg:rounded-none rounded-lg">
      <div className="lg:bg-silver-light bg-white py-3 flex lg:border-0 border-b flex-col lg:rounded-none rounded-lg">
        <h3 className="lg:text-xs text-[10px] lg:font-bold font-normal px-5 uppercase">
          Apocryphal BOOKS
        </h3>
        <div className="lg:hidden text-primary-dark ">
          <SideBarEl
            value={activeBook !== undefined ? activeBook.id?.toString() : ""}
            onChange={(opt) => {
              if (opt?.value) changeBook(opt.rawValue as IBook);
            }}
            options={booksListSorted?.map((book) => ({
              label: book.name,
              value: book.id.toString(),
              rawValue: book,
            }))}
          />
        </div>
      </div>
      <div className="lg:flex-1 lg:min-h-0 overflow-y-auto overflow-x-hidden lg:flex hidden">
        <div className="w-full h-full">
          {booksListSorted ? (
            booksListSorted?.map((book) => (
              <TooltipEl
                key={book.id}
                trigger={
                  <button
                    type="button"
                    onClick={() => changeBook(book)}
                    className={cn(
                      "px-5 py-2 transition-all w-full text-start block max-w-full text-sm overflow-hidden text-ellipsis whitespace-nowrap hover:scale-110",
                      activeBook.id === book.id
                        ? "bg-secondary font-bold text-primary-dark "
                        : "hover:font-bold hover:text-primary-dark hover:bg-secondary"
                    )}
                  >
                    {book.name}
                  </button>
                }
                content={book.name}
              />
            ))
          ) : (
            <BooksLoadingPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarChaptersComponent() {
  const {
    activeBook,
    chaptersList,
    activeChapter,
    setActiveChapter,
    booksList,
  } = useReadBookStore();
  const openInReader = useOpenInReader();

  const changeChapter = (chapterId: number) => {
    const chapter = chaptersList?.find((ch) => ch.id === chapterId);
    if (activeBook.data && chapter) openInReader(activeBook.data, chapter);
    else setActiveChapter(chapterId);
  };

  const value = useMemo(
    () => (activeChapter || {}).id?.toString() || "",
    [activeChapter]
  );
  const options = useMemo(
    () =>
      (chaptersList || [])?.map((chapter) => ({
        label: String(chapter.name),
        value: (chapter.id || "").toString(),
        rawValue: chapter,
      })),
    [chaptersList]
  );

  return (
    <div className="lg:min-w-[56px] lg:max-w-[56px] w-full lg:flex lg:flex-col lg:h-full lg:min-h-0 lg:border-r-2 lg:border-0 border text-primary-dark border-solid rounded-lg lg:rounded-none">
      <div className="lg:bg-silver-light bg-white py-3  lg:border-0 border-b flex flex-col lg:rounded-none rounded-lg">
        <h3 className="lg:text-xs lg:font-bold font-normal text-[10px] lg:block hidden px-3 ">
          CH.
        </h3>
        <h3 className="font-normal text-[10px] uppercase lg:hidden px-4 ">
          Chapter
        </h3>
        {/* For iphone and mobile responses  */}
        {/* <select
                    name="chapter"
                    onChange={(e) => setActiveChapter(Number(e.target.value))}
                    className="lg:hidden pt-1 mx-4">
                    {
                        chaptersList?.map((chapter) => (
                            <option key={chapter.id} value={chapter.id}>
                                {chapter.name}
                            </option>
                        ))
                    }
                </select> */}
        <div className="lg:hidden text-primary-dark">
          <SideBarEl
            value={value}
            onChange={(opt) => {
              if (opt?.value) changeChapter(Number(opt.value));
            }}
            options={options}
          />
        </div>
      </div>
      <div className="lg:flex-1 lg:min-h-0 overflow-y-auto">
        <ul className="lg:flex flex-col hidden min-h-full">
          {activeBook.loading || !chaptersList || !booksList ? (
            <ChaptersLoadingPlaceholder />
          ) : (
            chaptersList?.map((chapter) => (
              <button
                type="button"
                key={chapter.id}
                onClick={() => changeChapter(chapter.id)}
                className={cn(
                  "px-3 py-2 transition-all text-sm hover:scale-110",
                  activeChapter.id === chapter.id
                    ? "font-bold text-primary-dark bg-secondary"
                    : "hover:font-bold hover:text-primary-dark hover:bg-secondary"
                )}
              >
                {chapter.name}
              </button>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
