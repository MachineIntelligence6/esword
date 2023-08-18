import { Author, Book, Chapter, Commentary, Note, Topic, User, UserRole, Verse } from "@prisma/client"

export type IChapter = Chapter & {
    book?: IBook,
    topics?: ITopic[]
}

export type IVerse = Verse & {
    topic?: ITopic,
    commentaries?: ICommentary[],
    notes?: INote[]
}
export type ITopic = Topic & {
    verses?: IVerse[];
    chapter?: IChapter
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
}

export type IUserRole = UserRole | "ALL"



export type SessionUser = Omit<User, "password">

