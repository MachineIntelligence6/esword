import clientApiHandlers from "@/client/handlers";
import { IAuthor, IBook, IChapter, ICommentary, ITopic, IVerse } from "@/shared/types/models.types";
import { create } from 'zustand'




type StoreStateItem<TData = unknown> = {
    loading?: boolean;
    data?: TData | null
}


type ActiveBook = StoreStateItem<IBook> & {
    id?: number;
}
type ActiveChapter = StoreStateItem<IChapter> & {
    id?: number;
}
type ActiveVerse = StoreStateItem<IVerse> & {
    id?: number;
}
type ActiveCommentary = StoreStateItem<ICommentary> & {
    id?: number;
}
type ActiveAuthor = StoreStateItem<IAuthor> & {
    id?: number;
}



type ReadBookStoreType = {
    initialLoading?: boolean;
    booksList?: IBook[] | null,
    chaptersList?: IChapter[] | null,
    topicsList?: ITopic[] | null,
    activeBook: ActiveBook,
    activeChapter: ActiveChapter;
    activeVerse: ActiveVerse;
    activeCommentary?: ActiveCommentary;
    activeAuthor?: ActiveAuthor;
    setActiveBook: (book: number) => Promise<void>;
    setActiveChapter: (chapter: number) => Promise<void>;
    setActiveVerse: (id: number, topic: number) => Promise<void>;
    setActiveAuthor: (author: IAuthor) => Promise<void>;
    loadInitialData: () => Promise<void>
}



export const useReadBookStore = create<ReadBookStoreType>()((set, get) => ({
    activeBook: {},
    activeChapter: {},
    activeVerse: {},
    activeCommentary: {},
    setActiveBook: async (bookId: number) => {
        if (bookId === get().activeBook.id) return;
        set((state) => ({
            ...state,
            activeBook: { number: bookId, loading: true },
            chaptersList: null,
            activeChapter: {},
            activeAuthor: {},
            activeVerse: {},
            activeCommentary: {},
            topicsList: null
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
        const firstChapter = get().chaptersList?.[0]
        if (firstChapter) await get().setActiveChapter(firstChapter.id)
    },
    setActiveChapter: async (chapterId: number) => {
        if (chapterId === get().activeChapter.id) return;
        set((state) => ({
            ...state,
            activeChapter: { number: chapterId, loading: true },
            activeAuthor: {},
            activeVerse: {},
            activeCommentary: {},
            topicsList: null
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
            topicsList: topics
        }))
        const firstTopic = topics?.[0]
        const firstVerse = firstTopic?.verses?.[0]
        if (firstTopic && firstVerse) await get().setActiveVerse(firstVerse.id, firstTopic.id);
    },
    setActiveVerse: async (verseId: number, topicId: number) => {
        if (verseId === get().activeVerse.id) return;
        set((state) => ({
            ...state,
            activeVerse: { number: verseId, loading: true },
            activeAuthor: {},
            activeCommentary: {},
        }))
        const topics = get().topicsList
        const verse = topics?.find((t) => t.id === topicId)?.verses?.find((v) => v.id === verseId)
        set((state) => ({
            ...state,
            activeVerse: {
                id: verseId,
                loading: false,
                data: verse
            },
        }))
        const commentaries = verse?.commentaries
        const author = (commentaries && commentaries?.length > 0) ? commentaries[0].author : undefined
        if (author) await get().setActiveAuthor(author)
    },
    setActiveAuthor: async (author: IAuthor) => {
        if (author.id === get().activeAuthor?.id) return;
        const firstCommentary = author.commentaries?.[0]
        set((state) => ({
            ...state,
            activeAuthor: {
                id: author.id,
                data: author
            },
            activeCommentary: {
                id: firstCommentary?.id,
                data: firstCommentary,
            }
        }))
    },
    loadInitialData: async () => {
        set({ initialLoading: true })
        const { data: books } = await clientApiHandlers.books.get({ page: 1, perPage: -1 })
        set((state) => ({ ...state, booksList: books }))
        const firstBook = books?.[0]
        if (firstBook) {
            await get().setActiveBook(firstBook.id)
        }
        set((state) => ({ ...state, initialLoading: false }))
    }
}))


