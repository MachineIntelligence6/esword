import { Book, Chapter, Commentary, Prisma, Verse } from '@prisma/client'
import { create } from 'zustand'




type StoreData = {
    book: Book,
    chapter: Chapter,
    name: string;
    number: number,
    commenteries: Commentary[]
}

type CreateVerseStore = {
    data?: StoreData | null,
    setData: (data: StoreData) => void
}


const useCreateVerseStore = create<CreateVerseStore>()((set) => ({
    data: null,
    setData: (data) => set((state) => ({ data: data }))
}))

