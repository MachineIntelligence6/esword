import { SessionUser } from "@/shared/types/models.types";
import { User } from "@prisma/client";



const editorAccessiblePaths = [
    /^\/dashboard$/,
    /^\/dashboard\/books$/,
    /^\/dashboard\/books\/.*$/,
    /^\/dashboard\/chapters$/,
    /^\/dashboard\/chapters\/.*$/,
    /^\/dashboard\/topics$/,
    /^\/dashboard\/topics\/.*$/,
    /^\/dashboard\/verses$/,
    /^\/dashboard\/verses\/.*$/,
]


export const canUserAccessPath = (user: SessionUser, path: string) => {
    if (user.role === "ADMIN") return true;
    if (user.role === "VIEWER" && path.startsWith("/dashboard")) return false;
    return editorAccessiblePaths.some(regex => regex.test(path));
}

