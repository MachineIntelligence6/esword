import { Activity, Author, Book, Bookmark, Chapter, Commentary, Highlight, Note, Topic, User, UserRole, Verse } from "@prisma/client"

export type IChapter = Chapter & {
    book?: IBook;
    topics?: ITopic[];
}

export type IVerse = Verse & {
    topic?: ITopic,
    commentaries?: ICommentary[],
    notes?: INote[]
    highlights?: IHighlight[]
}
export type ITopic = Topic & {
    verses?: IVerse[];
    chapter?: IChapter
}
export type IBookmark = Bookmark & {
    verse?: IVerse;
    user?: IUser
}
export type IHighlight = Highlight & {
    verse?: IVerse;
    user?: IUser
}

export type IBook = Book & {
    chapters?: IChapter[]
}

export type ICommentary = Commentary & {
    author?: IAuthor;
    verse?: IVerse;
}
export type INote = Note & {
    user?: IUser;
    verse?: IVerse;
}

export type IAuthor = Author & {
    commentaries?: ICommentary[];
}


export type IUser = User & {
    notes?: INote[];
    highlights?: IHighlight[];
}

export type IActivity = Activity & {
    user?: IUser;
}


export type IUserRole = UserRole | "ALL"



export type SessionUser = Omit<Omit<User, "password">, "id"> & {
    id: string
}

