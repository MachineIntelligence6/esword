"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import clientApiHandlers from "@/client/handlers";
import { IBook, IChapter } from "@/shared/types/models.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Spinner from "@/components/spinner";

function parseIdList(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function serializeIdList(ids: number[]): string | null {
  if (ids.length === 0) return null;
  return Array.from(new Set(ids))
    .sort((a, b) => a - b)
    .join(",");
}

export function useParentListFilters() {
  const searchParams = useSearchParams();
  const bookIds = parseIdList(searchParams.get("book"));
  const chapterIds = parseIdList(searchParams.get("chapter"));

  return {
    bookIds,
    chapterIds,
    bookId: bookIds[0],
    chapterId: chapterIds[0],
  };
}

type ParentFiltersContextValue = {
  showChapter: boolean;
  bookIds: number[];
  chapterIds: number[];
  books: IBook[] | null;
  chapters: IChapter[] | null;
  selectedBooks: IBook[];
  selectedChapters: IChapter[];
  hasFilters: boolean;
  booksOpen: boolean;
  setBooksOpen: (open: boolean) => void;
  chaptersOpen: boolean;
  setChaptersOpen: (open: boolean) => void;
  toggleBook: (id: number) => void;
  toggleChapter: (id: number) => void;
  clearFilters: () => void;
};

const ParentFiltersContext = createContext<ParentFiltersContextValue | null>(
  null
);

function useParentFiltersContext() {
  const ctx = useContext(ParentFiltersContext);
  if (!ctx) {
    throw new Error("Parent filter controls require ParentFiltersProvider");
  }
  return ctx;
}

export function ParentFiltersProvider({
  showChapter = false,
  children,
}: {
  showChapter?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { bookIds, chapterIds } = useParentListFilters();

  const [books, setBooks] = useState<IBook[] | null>(null);
  const [chapters, setChapters] = useState<IChapter[] | null>(null);
  const [booksOpen, setBooksOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);

  useEffect(() => {
    clientApiHandlers.books
      .get({
        page: 1,
        perPage: -1,
        orderBy: [{ priority: "desc" }, { name: "asc" }],
      })
      .then((res) => setBooks(res.data ?? []));
  }, []);

  useEffect(() => {
    if (!showChapter || bookIds.length === 0) {
      setChapters([]);
      return;
    }
    setChapters(null);
    clientApiHandlers.chapters
      .get({
        page: 1,
        perPage: -1,
        orderBy: { name: "asc" },
        include: { book: true },
        where: { bookId: { in: bookIds } },
      })
      .then((res) => setChapters(res.data ?? []));
  }, [showChapter, bookIds.join(",")]);

  const selectedBooks = useMemo(
    () => books?.filter((book) => bookIds.includes(book.id)) ?? [],
    [books, bookIds]
  );

  const selectedChapters = useMemo(
    () => chapters?.filter((chapter) => chapterIds.includes(chapter.id)) ?? [],
    [chapters, chapterIds]
  );

  const hasFilters = bookIds.length > 0 || chapterIds.length > 0;

  const updateParams = (next: {
    book?: number[] | null;
    chapter?: number[] | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next.book !== undefined) {
      const serialized = next.book === null ? null : serializeIdList(next.book);
      if (serialized) params.set("book", serialized);
      else params.delete("book");
    }

    if (next.chapter !== undefined) {
      const serialized =
        next.chapter === null ? null : serializeIdList(next.chapter);
      if (serialized) params.set("chapter", serialized);
      else params.delete("chapter");
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const toggleBook = (id: number) => {
    const next = bookIds.includes(id)
      ? bookIds.filter((bookId) => bookId !== id)
      : [...bookIds, id];
    const nextChapters =
      next.length === 0
        ? []
        : chapterIds.filter((chapterId) => {
            const chapter = chapters?.find((item) => item.id === chapterId);
            return chapter ? next.includes(chapter.bookId) : false;
          });
    updateParams({ book: next, chapter: nextChapters });
  };

  const toggleChapter = (id: number) => {
    const next = chapterIds.includes(id)
      ? chapterIds.filter((chapterId) => chapterId !== id)
      : [...chapterIds, id];
    updateParams({ chapter: next });
  };

  const clearFilters = () => {
    updateParams({ book: null, chapter: null });
  };

  const value: ParentFiltersContextValue = {
    showChapter,
    bookIds,
    chapterIds,
    books,
    chapters,
    selectedBooks,
    selectedChapters,
    hasFilters,
    booksOpen,
    setBooksOpen,
    chaptersOpen,
    setChaptersOpen,
    toggleBook,
    toggleChapter,
    clearFilters,
  };

  return (
    <ParentFiltersContext.Provider value={value}>
      {children}
    </ParentFiltersContext.Provider>
  );
}

export function ParentFilterControls({ className }: { className?: string }) {
  const {
    showChapter,
    bookIds,
    chapterIds,
    books,
    chapters,
    hasFilters,
    booksOpen,
    setBooksOpen,
    chaptersOpen,
    setChaptersOpen,
    toggleBook,
    toggleChapter,
    clearFilters,
  } = useParentFiltersContext();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <MultiFilterPopover
        open={booksOpen}
        onOpenChange={setBooksOpen}
        label="Books"
        count={bookIds.length}
        loading={!books}
        searchPlaceholder="Search books..."
        emptyText="No books found."
        options={
          books?.map((book) => ({
            value: String(book.id),
            label: book.name,
            selected: bookIds.includes(book.id),
            onSelect: () => toggleBook(book.id),
          })) ?? []
        }
      />

      {showChapter && (
        <MultiFilterPopover
          open={chaptersOpen}
          onOpenChange={setChaptersOpen}
          label="Chapters"
          count={chapterIds.length}
          disabled={bookIds.length === 0}
          loading={bookIds.length > 0 && !chapters}
          searchPlaceholder="Search chapters..."
          emptyText={
            bookIds.length === 0 ? "Select a book first." : "No chapters found."
          }
          options={
            chapters?.map((chapter) => ({
              value: String(chapter.id),
              label: `${chapter.book?.name ?? "Book"} · Chapter ${chapter.name}`,
              selected: chapterIds.includes(chapter.id),
              onSelect: () => toggleChapter(chapter.id),
            })) ?? []
          }
        />
      )}

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-2"
          onClick={clearFilters}
        >
          Clear filters ({bookIds.length + chapterIds.length})
        </Button>
      )}
    </div>
  );
}

export function ParentFilterTags({ className }: { className?: string }) {
  const {
    bookIds,
    books,
    selectedBooks,
    selectedChapters,
    hasFilters,
    toggleBook,
    toggleChapter,
  } = useParentFiltersContext();

  if (!hasFilters) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label="Applied filters">
      {selectedBooks.map((book) => (
        <span
          key={`book-${book.id}`}
          className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-white py-1 pl-3 pr-1 text-sm text-slate-950"
        >
          <span>
            <span className="text-slate-600">Book:</span>{" "}
            <span className="font-semibold">{book.name}</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${book.name}`}
            className="rounded-sm p-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-danger"
            onClick={() => toggleBook(book.id)}
          >
            <Cross2Icon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      {selectedChapters.map((chapter) => (
        <span
          key={`chapter-${chapter.id}`}
          className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-white py-1 pl-3 pr-1 text-sm text-slate-950"
        >
          <span>
            <span className="text-slate-600">Chapter:</span>{" "}
            <span className="font-semibold">
              {chapter.book?.name
                ? `${chapter.book.name} · Ch ${chapter.name}`
                : `Chapter ${chapter.name}`}
            </span>
          </span>
          <button
            type="button"
            aria-label={`Remove chapter ${chapter.name}`}
            className="rounded-sm p-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-danger"
            onClick={() => toggleChapter(chapter.id)}
          >
            <Cross2Icon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      {books &&
        bookIds
          .filter((id) => !selectedBooks.some((book) => book.id === id))
          .map((id) => (
            <span
              key={`book-pending-${id}`}
              className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-white py-1 pl-3 pr-1 text-sm text-slate-950"
            >
              <span>
                <span className="text-slate-600">Book:</span>{" "}
                <span className="font-semibold">#{id}</span>
              </span>
              <button
                type="button"
                className="rounded-sm p-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-danger"
                onClick={() => toggleBook(id)}
              >
                <Cross2Icon className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
    </div>
  );
}

/** Standalone full filter block (controls + tags) for non-shell layouts */
export function ParentListFilters({
  showChapter = false,
  className,
}: {
  showChapter?: boolean;
  className?: string;
}) {
  return (
    <ParentFiltersProvider showChapter={showChapter}>
      <div className={cn("mb-4 space-y-3", className)}>
        <ParentFilterControls />
        <ParentFilterTags />
      </div>
    </ParentFiltersProvider>
  );
}

type FilterOption = {
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

function MultiFilterPopover({
  open,
  onOpenChange,
  label,
  count,
  options,
  loading,
  disabled,
  searchPlaceholder,
  emptyText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  count: number;
  options: FilterOption[];
  loading?: boolean;
  disabled?: boolean;
  searchPlaceholder: string;
  emptyText: string;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-9"
        >
          {label}
          {count > 0 && (
            <Badge
              variant="secondary"
              className="ml-2"
            >
              {count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-8 w-8 border-4" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => option.onSelect()}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-xs border border-slate-400",
                          option.selected
                            ? "border-primary bg-primary text-white"
                            : "bg-white opacity-80"
                        )}
                      >
                        {option.selected && <CheckIcon className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
