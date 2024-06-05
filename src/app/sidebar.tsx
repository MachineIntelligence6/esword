"use client";
import {
  BooksLoadingPlaceholder,
  ChaptersLoadingPlaceholder,
} from "@/components/loading-placeholders";
import { SideBarEl } from "@/components/ui/select";
import { TooltipEl } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { IBook } from "@/shared/types/models.types";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SiteSidebar() {
  const searchParams = useSearchParams();
  const { loadInitialData } = useReadBookStore();

  const doInitialLoadWork = async () => {
    const book = searchParams.get("book") ?? undefined;
    const chapter = parseInt(searchParams.get("chapter") ?? "-1");
    const verse = parseInt(searchParams.get("verse") ?? "-1");
    await loadInitialData(
      book,
      chapter === -1 ? undefined : chapter,
      verse === -1 ? undefined : verse
    );
  };

  useEffect(() => {
    doInitialLoadWork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // useEffect(() => {
  //     if (booksList && chaptersList) return;
  //     doInitialLoadWork()
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  return (
    <div className="flex lg:my-0 my-1 gap-x-3 lg:gap-x-0 bg-white w-full lg:px-0 px-3">
      <SidebarBooksComponent />
      <SidebarChaptersComponent />
    </div>
    // <div className="flex lg:my-0 my-1 gap-x-3 lg:gap-x-0 resize-x bg-white lg:max-w-[186px] lg:min-w-[186px] w-full lg:px-0 px-3">
    //     <SidebarBooksComponent />
    //     <SidebarChaptersComponent />
    // </div>
  );
}

const sortByPriority = (a: IBook, b: IBook) => {
  if (a.priority === 0) return 1;
  if (b.priority === 0) return -1;
  return a.priority - b.priority;
};

function SidebarBooksComponent() {
  const { booksList, activeBook } = useReadBookStore();
  const booksListSorted = booksList?.sort(sortByPriority);

  const changeBook = (book: IBook) => {
    window.location.replace(`/?book=${book.slug}`);
    // window.location.reload()
  };
  return (
    // <div className="lg:min-w-[130px] lg:max-w-[130px] w-full lg:border-0 lg:border-r-2 border border-solid text-primary-dark lg:rounded-none rounded-lg">
    <div className="lg:min-w-[130px] w-full lg:border-0 lg:border-r-2 border border-solid text-primary-dark lg:rounded-none rounded-lg">
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
      <div className="h-[calc(100vh_-_100px)] overflow-y-auto overflow-x-hidden lg:flex hidden">
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

  return (
    <div className="lg:min-w-[56px] lg:max-w-[56px] w-full lg:border-r-2 lg:border-0 border text-primary-dark border-solid rounded-lg lg:rounded-none">
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
            value={
              activeChapter !== undefined ? activeChapter.id?.toString() : ""
            }
            onChange={(opt) => {
              if (opt?.value) setActiveChapter(Number(opt.value));
            }}
            options={chaptersList?.map((chapter) => ({
              label: String(chapter.name),
              value: chapter.id.toString(),
              rawValue: chapter,
            }))}
          />
        </div>
      </div>
      <div className="lg:h-[calc(100vh_-_100px)]  overflow-y-auto">
        <ul className="lg:flex flex-col hidden min-h-full">
          {activeBook.loading || !chaptersList || !booksList ? (
            <ChaptersLoadingPlaceholder />
          ) : (
            chaptersList?.map((chapter) => (
              <button
                type="button"
                key={chapter.id}
                onClick={() => setActiveChapter(chapter.id)}
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
