import { AsyncLocalStorage } from "node:async_hooks";
import { ActivityActionType, ActivityModelType, Prisma, PrismaClient } from "@prisma/client";
import { getServerAuth } from "./auth";
import { scrubPasswords } from "./scrub-passwords";
import { describeActivity } from "./activity-log";

const basePrisma = new PrismaClient()

const activityModels = [
    "Book", "Chapter",
    "Topic", "Verse",
    "Author", "Commentary",
    "Note", "User", "Blog",
    "AboutContent"
]

// Set while a handler logs one summary entry for a whole job (e.g. a CSV
// import) so its individual writes don't each add a row to the activity log.
const activityLogMuted = new AsyncLocalStorage<boolean>()

export function withoutActivityLog<T>(fn: () => Promise<T>): Promise<T> {
    return activityLogMuted.run(true, fn)
}

export async function logActivity(entry: {
    action: ActivityActionType,
    model: ActivityModelType,
    description: (userName: string) => string,
    ref?: number | null,
}) {
    const session = await getServerAuth();
    if (!session) return;
    await basePrisma.activity.create({
        data: {
            action: entry.action,
            model: entry.model,
            description: entry.description(session.user.name),
            ref: entry.ref ?? null,
            userId: Number(session.user.id),
        }
    })
}


const activityOperations = [
    "create",
    "createMany",
    "update",
    "updateMany",
    "delete",
    "deleteMany",
    "upsert"
]



function getActivityAction(operation: string, args: any): ActivityActionType | undefined {
    if (operation === "create" || operation === "createMany") return "CREATE"
    if (operation === "delete" || operation === "deleteMany") return "DELETE"
    if (operation === "update" || operation === "updateMany" || operation === "upsert") {
        const archived: boolean | undefined = args.data?.archived
        if (archived === true) return "ARCHIVE"
        if (archived === false) return "RESTORE"
        return "UPDATE"
    }
    return undefined
}





function getActivityModel(model: Prisma.ModelName): ActivityModelType | undefined {
    if (model === "User") return "USERS"
    if (model === "Book") return "BOOKS"
    if (model === "Chapter") return "CHAPTERS"
    if (model === "Topic") return "TOPICS"
    if (model === "Verse") return "VERSES"
    if (model === "Note") return "NOTES"
    if (model === "Commentary") return "COMMENTARIES"
    if (model === "Author") return "AUTHORS"
    if (model === "Blog") return "BLOGS"
    if (model === "AboutContent") return "ABOUTCONTENT"
    return undefined
}




basePrisma.$use(async (params, next) => {
    if (params.action === "update" || params.action === "updateMany") {
        if (params.args.data.archived === true) {
            params.args.data.archivedAt = new Date()
        } else if (params.args.data.archived === false) {
            params.args.data.archivedAt = null
        }
    }
    const result = await next(params);
    if (result && typeof result === "object") {
        // Keep the hash only on the top-level rows of a direct User read.
        scrubPasswords(result, params.model === "User")
    }
    const { model, action, args } = params
    if (model && activityModels.includes(model.toString()) && activityOperations.includes(action)) {
        if (activityLogMuted.getStore()) return result;
        // Bulk ops return `{ count }`. Nothing matched means nothing changed
        // (e.g. archiving a verse's commentaries when it has none).
        const bulkCount: number | undefined = action.endsWith("Many") ? result?.count : undefined
        if (bulkCount === 0) return result;
        const session = await getServerAuth();
        let activityAction = getActivityAction(action, args)
        let activityModel = getActivityModel(model)
        if (!session || !activityAction || !activityModel) return result;
        const description = describeActivity(session.user.name, activityAction, model, bulkCount)
        // `result` is the actual row Prisma just wrote (create/update/upsert/delete
        // all return it), so its id is always correct — unlike `args.where.id`,
        // which is undefined whenever the write is keyed by something else (e.g.
        // a chapter upserted by `slug`, a book upserted by `name`). Bulk ops
        // (updateMany/deleteMany) return `{ count }` with no id, so those still
        // fall back to `args.where.id` and usually end up with no ref, which is
        // expected since there's no single record to point at.
        const refId: number | undefined | null = result?.id ?? (args as any)?.where?.id

        await basePrisma.activity.create({
            data: {
                action: activityAction,
                model: activityModel,
                description: description,
                ref: (refId && !isNaN(refId) ? refId : null),
                userId: Number(session.user.id)
            }
        })
    }
    return result;
});



const db = basePrisma.$extends(({
    // query: {
    //     $allModels: {
    //         $allOperations: async ({ args, model, operation, query }) => {
    //             if (activityModels.includes(model) && activityOperations.includes(operation)) {
    //                 const session = await getServerAuth();
    //                 let action = getActivityAction(operation, args)
    //                 let activityModel = getActivityModel(model)
    //                 if (!session || !action || !activityModel) return query(args);
    //                 const description = `${session.user.name} ${action.toLowerCase()}d ${action === "CREATE" ? "new" : ""} ${model.toLowerCase()}`;
    //                 const refId: number | undefined | null = (args as any)?.where?.id


    //                 const activity = await basePrisma.activity.create({
    //                     data: {
    //                         action: action,
    //                         model: activityModel,
    //                         description: description,
    //                         ref: refId,
    //                         userId: Number(session.user.id)
    //                     }
    //                 })
    //                 console.log(activity)
    //             }
    //             return query(args)
    //         }
    //     }
    // },
}))


export default db;