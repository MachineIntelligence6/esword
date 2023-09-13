import clientApiHandlers from "@/client/handlers";
import { IBook, IBookmark, IChapter, ICommentary, IHighlight, ITopic, IVerse } from "@/shared/types/models.types";
import { Author } from "@prisma/client";
import { getSession } from "next-auth/react";
import { create } from 'zustand'




type StoreStateItem<TData = unknown> = {
    loading?: boolean;
    data?: TData | null
}



type ActiveAuthor = Author & {
    commentaries?: CommentariesState
}



type CommentariesState = {
    active?: ICommentary | null;
    list?: ICommentary[] | null
}
type AuthorsState = {
    active?: ActiveAuthor | null;
    list?: Author[] | null
}



type ActiveBook = StoreStateItem<IBook> & {
    id?: number;
}
type ActiveChapter = StoreStateItem<IChapter> & {
    id?: number;
}
type ActiveVerse = StoreStateItem<IVerse> & {
    id?: number;
    authors?: AuthorsState;
    selectedText?: string;
}
type ActiveCommentary = StoreStateItem<ICommentary> & {
    id?: number;
}




type ReadBookStoreType = {
    initialLoading?: boolean;
    booksList?: IBook[] | null,
    chaptersList?: IChapter[] | null,
    bookmarksList?: IBookmark[] | null,
    topicsList?: ITopic[] | null,
    activeBook: ActiveBook,
    activeChapter: ActiveChapter;
    activeBookmark?: IBookmark | null;
    activeVerse: ActiveVerse;
    // activeAuthor?: ActiveAuthor;
    activeVerseNote: {
        text?: string;
        noteId?: number;
        changed?: boolean;
    };
    saveHighlight: (verse: number, text: string, index: number) => void,
    removeHighlight: (verse: number, text: string, index: number) => void,
    setActiveBookmark: (value: IBookmark) => void;
    createNewBookmark: (verse?: IVerse) => Promise<void>;
    loadBookmarks: () => Promise<void>;
    setActiveVerseNote: (note?: string) => void;
    setActiveBook: (book: number, chapter?: number, verse?: number) => Promise<void>;
    setActiveCommentary: (commentary: number) => void;
    setActiveChapter: (chapter: number, verse?: number) => Promise<void>;
    setActiveVerse: (id: number) => Promise<void>;
    setActiveAuthor: (author: number) => void;
    loadInitialData: (book?: string, chapter?: number, verse?: number) => Promise<void>
}

const checkAndSaveNote = (state: ReadBookStoreType) => {
    const note = state.activeVerseNote;
    const activeVerse = state.activeVerse;
    if ((note.noteId && note.noteId === activeVerse.id && note.text !== activeVerse.data?.notes?.[0]?.text)) {
        clientApiHandlers.notes.create({
            verse: note.noteId,
            text: note.text ?? ""
        })
    } else if ((note.text && note.text !== "") && activeVerse.id) {
        clientApiHandlers.notes.create({
            verse: activeVerse.id,
            text: note.text ?? ""
        })
    }
}

const syncHighlightsWithDB = async (verseId: number, highlights: IHighlight[]) => {
    await clientApiHandlers.verses.updateHighlights(verseId, highlights)
}



export const useReadBookStore = create<ReadBookStoreType>()(
    (set, get) => ({
        activeBook: {},
        activeChapter: {},
        activeVerse: {},
        activeVerseNote: {},
        noteWarningPopupOpen: false,
        setActiveBook: async (bookId, chapterNum, verseNum) => {
            if (bookId === get().activeBook.id) return;
            checkAndSaveNote(get())
            set((state) => ({
                ...state,
                activeBook: { id: bookId, loading: true },
                chaptersList: null,
                activeChapter: {},
                activeVerse: {},
                topicsList: null,
                activeVerseNote: {},
                commentaries: {}
            }))
            const book = get().booksList?.find((b) => b.id === bookId)
            const { data: chapters } = await clientApiHandlers.chapters.get({
                page: 1, perPage: -1,
                book: bookId,
                orderBy: {
                    name: "asc"
                }
            })
            set((state) => ({
                ...state,
                chaptersList: chapters,
                activeBook: {
                    id: bookId,
                    loading: false,
                    data: book
                },
            }))
            const chapter = chapterNum ? get().chaptersList?.find((ch) => ch.name === chapterNum) : get().chaptersList?.[0]
            if (chapter) await get().setActiveChapter(chapter.id, verseNum)
        },
        setActiveChapter: async (chapterId, verseNum) => {
            if (chapterId === get().activeChapter.id) return;
            checkAndSaveNote(get())
            const session = await getSession()
            if (!session) return;
            set((state) => ({
                ...state,
                activeChapter: { id: chapterId, loading: true },
                activeVerse: {},
                topicsList: null,
                activeVerseNote: {},
                commentaries: {}
            }))
            const chapter = get().chaptersList?.find((ch) => ch.id === chapterId)
            const { data: topics } = await clientApiHandlers.topics.get({
                page: 1, perPage: -1,
                chapter: chapterId,
                orderBy: {
                    number: "asc"
                },
                include: {
                    verses: {
                        where: {
                            archived: false,
                        },
                        orderBy: {
                            number: "asc"
                        },
                        include: {
                            topic: {
                                include: {
                                    chapter: {
                                        include: {
                                            book: true
                                        }
                                    }
                                }
                            },
                            highlights: {
                                where: {
                                    userId: Number(session.user.id)
                                }
                            }
                        }
                    }
                }
            })
            set((state) => ({
                ...state,
                activeChapter: {
                    id: chapterId,
                    loading: false,
                    data: chapter
                },
                topicsList: topics,
            }))
            if (verseNum) {
                const versesList = topics?.flatMap((topic) => topic.verses)
                const verse = versesList?.find((verse) => verse?.number === verseNum)
                if (verse) get().setActiveVerse(verse.id)
            }
        },
        setActiveVerse: async (verseId: number) => {
            if (verseId === get().activeVerse.id) return;
            checkAndSaveNote(get())
            set((state) => ({
                ...state,
                activeVerse: { id: verseId, loading: true, data: null },
                activeVerseNote: {},
                commentaries: {}
            }))
            const session = await getSession()
            const { data: verse } = await clientApiHandlers.verses.getById(
                verseId,
                {
                    topic: {
                        include: {
                            chapter: {
                                include: {
                                    book: true
                                }
                            }
                        }
                    },
                    commentaries: {
                        where: { archived: false },
                        include: {
                            author: {
                                include: {
                                    commentaries: {
                                        where: { archived: false }
                                    }
                                }
                            }
                        }
                    },
                    notes: {
                        where: {
                            archived: false,
                            userId: Number(session?.user.id)
                        },
                    }
                }
            )
            const authors: ActiveAuthor[] = []
            verse?.commentaries?.forEach((c) => {
                if (!c.author || authors.some((a) => a.id === c.author?.id)) return;
                authors.push({
                    ...c.author,
                    commentaries: {
                        list: c.author.commentaries,
                        active: c.author.commentaries?.[0]
                    }
                })
            })
            const firstAuthor = authors?.[0]
            set((state) => ({
                ...state,
                activeVerse: {
                    id: verseId,
                    loading: false,
                    data: verse,
                    authors: {
                        list: authors,
                        active: firstAuthor
                    }
                },
                activeVerseNote: {
                    text: verse?.notes?.[0]?.text,
                    noteId: verse?.id
                }
            }))
        },
        setActiveAuthor: async (authorId) => {
            if (authorId === get().activeVerse.authors?.active?.id) return;
            const activeVerse = get().activeVerse;
            // const activeAuthor = get().activeVerse.authors?.active;
            if (!activeVerse) return;
            const author = activeVerse.authors?.list?.find((a) => a.id === authorId)
            set((state) => ({
                ...state,
                activeVerse: {
                    ...activeVerse,
                    authors: {
                        list: activeVerse.authors?.list,
                        active: author
                    }
                },
            }))
        },
        setActiveCommentary: (commentaryId) => {
            const activeVerse = get().activeVerse;
            const activeAuthor = get().activeVerse.authors?.active;
            if (!activeVerse || !activeAuthor) return;
            const activeCommentary = activeAuthor.commentaries?.list?.find((c) => c.id === commentaryId)
            set((state) => ({
                ...state,
                activeVerse: {
                    ...activeVerse,
                    authors: {
                        list: activeVerse.authors?.list,
                        active: {
                            ...activeAuthor,
                            commentaries: {
                                ...activeAuthor.commentaries,
                                active: activeCommentary
                            }
                        }
                    }
                }
            }))
        },
        setActiveVerseNote: (note) => {
            set((state) => ({
                ...state,
                activeVerseNote: {
                    text: note,
                    noteId: get().activeVerse.id,
                    changed: (note !== undefined || !(get().activeVerseNote.noteId && note === ""))
                }
            }))
        },
        setActiveBookmark: async (bookmark) => {
            set((state) => ({
                ...state,
                activeBookmark: bookmark,
            }))
            if (bookmark.verse?.topic?.chapter?.book) {
                await get().setActiveBook(bookmark.verse?.topic?.chapter?.book?.id)
                await get().setActiveChapter(bookmark.verse?.topic?.chapter?.id)
                await get().setActiveVerse(bookmark.verse?.id)
            }
        },
        createNewBookmark: async (verse) => {
            if (!verse) return
            const { data: bookmark } = await clientApiHandlers.bookmarks.create(verse?.id)
            if (bookmark) await get().loadBookmarks()
        },
        loadBookmarks: async () => {
            set((state) => ({ ...state, bookmarksList: null }))
            const { data: bookmarks } = await clientApiHandlers.bookmarks.get({ page: 1, perPage: -1 })
            set((state) => ({ ...state, bookmarksList: bookmarks }))
        },
        saveHighlight: async (verseId, text, index) => {
            const session = await getSession()
            const activeVerse = get().activeVerse.data
            if (!session || !activeVerse) return;
            const updatedTopicsList = get().topicsList?.map(topic => {
                if (topic.verses) {
                    const verses = topic.verses.map((verse) => {
                        if (verse.id === verseId) {
                            const highlightExist = verse.highlights?.find((h) => {
                                return ((h.text.includes(text) || text.includes(h.text)) && index === h.index)
                            })
                            const newHighlight: IHighlight = {
                                id: (new Date().getTime() + Math.random() * 9999),
                                index: (highlightExist ? (index + 1) : index),
                                text: text,
                                userId: Number(session?.user.id),
                                verseId: verse.id
                            }
                            const updatedHighlights = [
                                ...(verse.highlights ?? []),
                                newHighlight,
                            ]
                            syncHighlightsWithDB(verse.id, updatedHighlights)
                            return {
                                ...verse,
                                highlights: updatedHighlights
                            }
                        }
                        return verse
                    })
                    return {
                        ...topic,
                        verses: verses
                    }
                }
                return topic;
            })
            set((state) => ({ ...state, topicsList: updatedTopicsList }))
        },
        removeHighlight: async (verseId, text, index) => {
            const session = await getSession()
            const activeVerse = get().activeVerse.data
            if (!session || !activeVerse) return;
            const updatedTopicsList = get().topicsList?.map(topic => {
                if (topic.verses) {
                    const verses = topic.verses.map((verse) => {
                        if (verse.id === verseId) {
                            const updatedHighlights = verse.highlights?.filter((h) => {
                                if (((h.text.includes(text.trim()) || text.trim().includes(h.text)) && h.index === index)) return false;
                                return true;
                            }) ?? []
                            syncHighlightsWithDB(verse.id, updatedHighlights)
                            return {
                                ...verse,
                                highlights: (updatedHighlights)
                            }
                        }
                        return verse
                    })
                    return {
                        ...topic,
                        verses: verses
                    }
                }
                return topic;
            })
            set((state) => ({ ...state, topicsList: updatedTopicsList }))
        },
        loadInitialData: async (bookSlug, chapterNum, verseNum) => {
            set({ initialLoading: true })
            const { data: books } = await clientApiHandlers.books.get({
                page: 1, perPage: -1,
                orderBy: [
                    {
                        priority: "desc",
                    },
                    {
                        name: "asc"
                    }
                ]
            })
            set((state) => ({ ...state, booksList: books }))
            await get().loadBookmarks()
            const book = bookSlug ? books?.find((b) => b.slug === bookSlug) : books?.[0]
            if (book) {
                await get().setActiveBook(book.id, chapterNum, verseNum)
            }
            set((state) => ({ ...state, initialLoading: false }))
        }
    })
)


