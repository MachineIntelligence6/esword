import { ApiResponse } from "@/shared/types/api.types";
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";
import { getServerAuth } from "../auth";

type AnyAuthResult = Session | ApiResponse<any>;

export function isAuthError(result: AnyAuthResult): result is ApiResponse<any> {
  return "succeed" in result && result.succeed === false;
}

export async function requireAuth(): Promise<AnyAuthResult> {
  const session = await getServerAuth();
  if (typeof session === "boolean" || !session?.user) {
    return { succeed: false, code: "UNAUTHORIZED", data: null };
  }
  return session;
}

export async function requireRole(roles: UserRole[]): Promise<AnyAuthResult> {
  const session = await requireAuth();
  if (isAuthError(session)) return session;
  if (!roles.includes(session.user.role)) {
    return { succeed: false, code: "UNAUTHORIZED", data: null };
  }
  return session;
}

export const requireAdmin = () => requireRole(["ADMIN"]);
export const requireContentManager = () => requireRole(["ADMIN", "EDITOR"]);
