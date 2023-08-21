import { Prisma } from "@prisma/client";
import { BasePaginationProps } from "./api.types";
import { IUserRole } from "./models.types";



export type BooksPaginationProps = BasePaginationProps<Prisma.BookInclude, Prisma.BookWhereInput, Prisma.BookOrderByWithRelationInput>
export type NotesPaginationProps = BasePaginationProps<Prisma.NoteInclude, Prisma.NoteWhereInput, Prisma.NoteOrderByWithRelationInput> & {
    user?: number;
    verse?: number;
}
export type CommentariesPaginationProps = BasePaginationProps<Prisma.CommentaryInclude, Prisma.CommentaryWhereInput, Prisma.CommentaryOrderByWithRelationInput> & {
    author?: number;
    verse?: number;
}

export type VersesPaginationProps = BasePaginationProps<Prisma.VerseInclude, Prisma.VerseWhereInput, Prisma.VerseOrderByWithRelationInput> & {
    topic?: number;
}
export type TopicsPaginationProps = BasePaginationProps<Prisma.TopicInclude, Prisma.TopicWhereInput, Prisma.TopicOrderByWithRelationInput> & {
    chapter?: number;
}


export type ChaptersPaginationProps = BasePaginationProps<Prisma.ChapterInclude, Prisma.ChapterWhereInput, Prisma.ChapterOrderByWithRelationInput> & {
    book?: number;
}

export type UserPaginationProps = BasePaginationProps<Prisma.UserInclude, Prisma.UserWhereInput, Prisma.UserOrderByWithRelationInput> & {
    role?: IUserRole
}