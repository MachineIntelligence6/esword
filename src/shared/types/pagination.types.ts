import { Prisma } from "@prisma/client";
import { BasePaginationProps } from "./api.types";



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

