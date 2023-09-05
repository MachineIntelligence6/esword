import { Prisma } from "@prisma/client";


export type ArchivesActionReq = {
    ids: number[];
    model: Prisma.ModelName;
}