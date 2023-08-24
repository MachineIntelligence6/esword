import { ActivityActionType, ActivityModelType, Prisma, PrismaClient } from "@prisma/client";
import { getServerAuth } from "./auth";

const basePrisma = new PrismaClient()

const activityModels = [
    "Book", "Chapter",
    "Topic", "Verse",
    "Author", "Author",
    "Note", "User"
]


const activityOperations = [
    "create",
    "createMany",
    "update",
    "updateMany",
    "delete",
    "deleteMany",
]



function getActivityAction(operation: string, args: any): ActivityActionType | undefined {
    if (operation === "create" || operation === "createMany") return "CREATE"
    if (operation === "delete" || operation === "deleteMany") return "DELETE"
    if (operation === "update" || operation === "updateMany") {
        const archived: boolean | undefined = args.data.archived
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
    const { model, action, args } = params
    if (model && activityModels.includes(model.toString()) && activityOperations.includes(action)) {
        const session = await getServerAuth();
        let activityAction = getActivityAction(action, args)
        let activityModel = getActivityModel(model)
        if (!session || !activityAction || !activityModel) return result;
        const description = `${session.user.name} ${activityAction.toLowerCase()}d ${activityAction === "CREATE" ? "new" : ""} ${model.toLowerCase()}${(activityAction === "CREATE" || activityAction === "UPDATE") ? "" : "(s)"}`;
        const refId: number | undefined | null = (activityAction === "CREATE") ? result.id : (args as any)?.where?.id


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