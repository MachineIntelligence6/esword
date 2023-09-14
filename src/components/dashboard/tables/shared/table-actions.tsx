import clientApiHandlers from "@/client/handlers"
import { toast } from "@/components/ui/use-toast"
import definedMessages from "@/shared/constants/messages"
import { IBook } from "@/shared/types/models.types"
import { Prisma } from "@prisma/client"



export const RESTORE_DESCRIPTION = "This action will restore the selected rows and all data linked with them."
export const DELETE_DESCRIPTION = "This action will delete permanentaly the selected rows and all data linked with them."
export const ARCHIVE_DESCRIPTION = "This action will delete the selected rows and all data linked with them."

const deletePermanantly = async (data: any[], modelName: Prisma.ModelName, successMessage: string) => {
    const res = await clientApiHandlers.archives.deletePermanantly({
        ids: data.map((d) => d.id),
        model: modelName
    })
    if (res.succeed) {
        toast({
            title: successMessage,
        })
        window.location.reload()
    } else {
        toast({
            title: "Error",
            variant: "destructive",
            description: definedMessages.UNKNOWN_ERROR
        })
    }
}
const archive = async (data: any[], modelName: Prisma.ModelName, successMessage: string) => {
    const res = await clientApiHandlers.archives.addToArchive({
        ids: data.map((d) => d.id),
        model: modelName
    })
    if (res.succeed) {
        toast({
            title: successMessage,
        })
        window.location.reload()
    } else {
        toast({
            title: "Error",
            variant: "destructive",
            description: definedMessages.UNKNOWN_ERROR
        })
    }
}


const restore = async (data: any[], modelName: Prisma.ModelName, successMessage: string) => {
    const res = await clientApiHandlers.archives.restore({
        ids: data.map((d) => d.id),
        model: modelName
    })
    console.log(res)
    if (res.succeed) {
        toast({
            title: successMessage,
        })
    } else {
        toast({
            title: "Error",
            variant: "destructive",
            description: definedMessages.UNKNOWN_ERROR
        })
    }
}


const tableActions = {
    deletePermanantly,
    archive,
    restore
}

export default tableActions