'use client'

import { BooksLoadingPlaceholder, ChaptersLoadingPlaceholder } from "@/components/loading-placeholders";
import { cn } from "@/lib/utils";
import { useReadBookStore } from "@/lib/zustand/readBookStore";


export default function SiteSidebar() {
    return (
        <div className="flex lg:mx-0 mx-[10px] lg:my-0 my-1 gap-x-3 lg:gap-x-0 bg-white lg:max-w-[186px] lg:min-w-[186px] w-full  lg:px-0 px-3">
            <SidebarBooksComponent />
            <SidebarChaptersComponent />
        </div>
    );
}



function SidebarBooksComponent() {
    const { booksList, activeBook, setActiveBook } = useReadBookStore()
    return (
        <div className="lg:min-w-[130px] lg:max-w-[130px] w-full lg:border-0 lg:border-r-2 border border-solid text-primary-dark lg:rounded-none rounded-lg">
            <div className="lg:bg-silver-light bg-white py-3 flex lg:border-0 border-b flex-col">
                <h3 className="lg:text-xs text-[10px] lg:font-bold font-normal px-5 hover:scale-110 transition-all">
                    BIBLE BOOKS
                </h3>
                <select
                    name="book"
                    onChange={(e) => setActiveBook(Number(e.target.value))}
                    className="lg:hidden mx-4 pt-1">
                    {
                        booksList?.map((book) => (
                            <option key={book.id} value={book.id}>
                                {book.name}
                            </option>
                        ))
                    }
                </select>
            </div>
            <div className="h-[calc(100vh_-_100px)] overflow-y-auto overflow-x-hidden lg:flex hidden">
                <div className="w-full h-full">
                    {
                        booksList ?
                            booksList?.map((book) => (
                                <button
                                    key={book.id} type="button"
                                    onClick={() => setActiveBook(book.id)}
                                    className={cn(
                                        "px-5 py-2 transition-all w-full text-start block max-w-full text-sm overflow-hidden text-ellipsis whitespace-nowrap",
                                        activeBook.id === book.id ? "bg-secondary font-bold text-primary-dark " : "hover:font-bold hover:text-primary-dark hover:bg-secondary hover:scale-110 transition-all"
                                    )}>
                                    {book.name}
                                </button>
                            ))
                            :
                            <BooksLoadingPlaceholder />
                    }
                </div>
            </div>
        </div>
    )
}

function SidebarChaptersComponent() {
    const { activeBook, chaptersList, activeChapter, setActiveChapter, booksList } = useReadBookStore()


    return (
        <div className="lg:min-w-[56px] lg:max-w-[56px] w-full lg:border-r-2 lg:border-0 border text-primary-dark border-solid rounded-lg lg:rounded-none">
            <div className="lg:bg-silver-light bg-white py-3  lg:border-0 border-b flex flex-col">
                <h3 className="lg:text-xs lg:font-bold font-normal text-[10px] lg:block hidden px-3 hover:scale-110 transition-all">
                    CH.
                </h3>
                <h3 className="font-normal text-[10px] uppercase lg:hidden px-4">
                    Chapter
                </h3>
                {/* For iphone and mobile responses  */}
                <select
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
                </select>
            </div>
            <div className="lg:h-[calc(100vh_-_100px)]  overflow-y-auto">
                <ul className="lg:flex flex-col hidden min-h-full">
                    {
                        (activeBook.loading || !chaptersList || !booksList) ?
                            <ChaptersLoadingPlaceholder />
                            :
                            chaptersList?.map((chapter) => (
                                <button
                                    type="button"
                                    key={chapter.id}
                                    onClick={() => setActiveChapter(chapter.id)}
                                    className={cn(
                                        "px-3 py-2 transition-all text-sm",
                                        activeChapter.id === chapter.id ? "font-bold text-primary-dark bg-secondary" : "hover:font-bold hover:text-primary-dark hover:bg-secondary hover:scale-110 transition-all"
                                    )}>
                                    {chapter.name}
                                </button>
                            ))
                    }
                </ul>

            </div>

        </div>
    )
}