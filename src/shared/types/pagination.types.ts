import { Prisma } from "@prisma/client";
import { BasePaginationProps } from "./api.types";
import { IUserRole } from "./models.types";



export type BooksPaginationProps = BasePaginationProps<Prisma.BookInclude, Prisma.BookWhereInput, Prisma.BookOrderByWithRelationAndSearchRelevanceInput>
export type NotesPaginationProps = BasePaginationProps<Prisma.NoteInclude, Prisma.NoteWhereInput, Prisma.NoteOrderByWithRelationAndSearchRelevanceInput> & {
    user?: number;
    verse?: number;
}
export type CommentariesPaginationProps = BasePaginationProps<Prisma.CommentaryInclude, Prisma.CommentaryWhereInput, Prisma.CommentaryOrderByWithRelationAndSearchRelevanceInput> & {
    author?: number;
    verse?: number;
}

export type VersesPaginationProps = BasePaginationProps<Prisma.VerseInclude, Prisma.VerseWhereInput, Prisma.VerseOrderByWithRelationAndSearchRelevanceInput> & {
    topic?: number;
}

export type TopicsPaginationProps = BasePaginationProps<Prisma.TopicInclude, Prisma.TopicWhereInput, Prisma.TopicOrderByWithRelationAndSearchRelevanceInput> & {
    chapter?: number;
}
export type ActivitesPaginationProps = BasePaginationProps<Prisma.ActivityInclude, Prisma.ActivityWhereInput, Prisma.ActivityOrderByWithRelationAndSearchRelevanceInput> & {
}
export type SearchPaginationProps = BasePaginationProps<Prisma.VerseInclude, Prisma.VerseWhereInput, Prisma.VerseOrderByWithRelationAndSearchRelevanceInput> & {
    query: string
}
export type AuthorsPaginationProps = BasePaginationProps<Prisma.AuthorInclude, Prisma.AuthorWhereInput, Prisma.AuthorOrderByWithRelationAndSearchRelevanceInput> & {
}


export type BookmarksPaginationProps = BasePaginationProps<Prisma.BookmarkInclude, Prisma.BookmarkWhereInput, Prisma.BookmarkOrderByWithRelationAndSearchRelevanceInput> & {
    verse?: number;
}
export type HighlightsPaginationProps = BasePaginationProps<Prisma.HighlightInclude, Prisma.HighlightWhereInput, Prisma.HighlightOrderByWithRelationAndSearchRelevanceInput> & {
    verse?: number;
}


export type ChaptersPaginationProps = BasePaginationProps<Prisma.ChapterInclude, Prisma.ChapterWhereInput, Prisma.ChapterOrderByWithRelationAndSearchRelevanceInput> & {
    book?: number;
}

export type UserPaginationProps = BasePaginationProps<Prisma.UserInclude, Prisma.UserWhereInput, Prisma.UserOrderByWithRelationAndSearchRelevanceInput> & {
    role?: IUserRole
}