import { Activity, Author, Blog, Book, Bookmark, Chapter, Commentary, Highlight, Note, Topic, User, UserRole, Verse } from "@prisma/client"

export type IChapter = Chapter & {
    book?: IBook;
    topics?: ITopic[];
    _count?: { topics?: number };
}

export type IVerse = Verse & {
    topic?: ITopic,
    commentaries?: ICommentary[],
    notes?: INote[]
    highlights?: IHighlight[]
    _count?: { commentaries?: number; notes?: number; bookmarks?: number; highlights?: number };
}
export type ITopic = Topic & {
    verses?: IVerse[];
    chapter?: IChapter
    _count?: { verses?: number };
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
    _count?: { chapters?: number };
}

export type ICommentary = Commentary & {
    author?: IAuthor;
    verse?: IVerse;
}
export type INote = Note & {
    user?: IUser;
    verse?: IVerse;
}
export type IBlog = Blog & {
    user?: Partial<IUser> | null;
    book?: IBook | null;
    chapter?: IChapter | null;
    verse?: IVerse | null;
}

export type IAuthor = Author & {
    commentaries?: ICommentary[];
    _count?: { commentaries?: number };
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
