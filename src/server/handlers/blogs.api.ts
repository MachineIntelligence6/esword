import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { BlogType, Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IBlog } from "@/shared/types/models.types";
import { BlogsPaginationProps, ChaptersPaginationProps } from "@/shared/types/pagination.types";
import { getServerAuth } from "../auth";





export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    user = -1, include, where, orderBy
}: BlogsPaginationProps): Promise<PaginatedApiResponse<IBlog[]>> {
    try {
        const blogs = await db.blog.findMany({
            where: where ? {
                ...where,
                archived: where.archived ?? false
            } : {
                ...(user !== -1 && {
                    userId: user
                }),
                archived: false,
            },
            orderBy: orderBy ? orderBy : {
                id: "asc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: (
                include ? include : { user: true }
            )
        })
        const blogsCount = await db.blog.count({
            where: where ? {
                ...where,
                archived: where.archived ?? false
            } : {
                ...(user !== -1 && {
                    userId: user
                }),
                archived: false,
            },
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: blogs.length,
                totalPages: Math.ceil(blogsCount / perPage),
                count: blogsCount,
            },
            data: blogs
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



export async function getByRef(ref: string, include?: Prisma.BlogInclude): Promise<ApiResponse<IBlog>> {
    try {
        const blog = await db.blog.findFirst({
            where: {
                OR: [
                    {
                        slug: ref
                    },
                    {
                        id: parseInt(ref)
                    }
                ],
                archived: false
            },
            include: (
                include ? include : { user: true }
            )
        })
        if (!blog) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: blog
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}





export async function archive(id: number): Promise<ApiResponse<IBlog>> {
    try {
        await db.blog.update({
            where: { id: id },
            data: {
                archived: true,
            }
        })
        return {
            succeed: true,
            data: null
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



type CreateBlogReq = {
    title: string;
    slug: string;
    content: string;
    type: BlogType;
    tags: string
}

export async function create(req: Request): Promise<ApiResponse<IBlog>> {
    try {
        const session = await getServerAuth()
        if (!session?.user) throw new Error();

        const blogReq = await req.json() as CreateBlogReq
        const blogExist = await db.blog.findFirst({
            where: { slug: blogReq.slug }
        })
        if (blogExist) {
            return {
                succeed: false,
                code: "SLUG_MUST_BE_UNIQUE",
            }
        }
        const blog = await db.blog.create({
            data: {
                title: blogReq.title,
                slug: blogReq.slug,
                content: blogReq.content,
                type: blogReq.type,
                userId: Number(session.user.id),
            },
        })
        if (!blog) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: blog
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






type UpdateBlogReq = {
    title?: string;
    slug?: string;
    content?: string;
    type?: BlogType;
    tags?: string;
}


export async function update(req: Request, id: number): Promise<ApiResponse<IBlog>> {
    try {
        const blogReq = await req.json() as UpdateBlogReq
        if (blogReq.slug) {
            const blogExist = await db.blog.findFirst({
                where: { slug: blogReq.slug }
            })
            if (blogExist && blogExist.id !== id) {
                return {
                    succeed: false,
                    code: "SLUG_MUST_BE_UNIQUE",
                }
            }
        }
        const blog = await db.blog.update({
            data: {
                ...(blogReq.title && { title: blogReq.title }),
                ...(blogReq.slug && { slug: blogReq.slug }),
                ...(blogReq.content && { content: blogReq.content }),
                ...(blogReq.type && { type: blogReq.type }),
                ...(blogReq.tags && { tags: blogReq.tags }),
            },
            where: {
                id: id
            }
        })
        if (!blog) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: blog
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
