import { getServerAuth } from "./auth";

// Per-user private relations: a non-admin may only ever see their own rows,
// regardless of what the client asked for.
const PRIVATE_RELATIONS = new Set(["notes", "highlights", "bookmarks"]);
// Relations that resolve to a User row. For non-admins we reduce these to a
// non-identifying projection so a content query can't be used to enumerate
// other users' email addresses (the password hash is additionally stripped in
// the Prisma layer — see scrub-passwords.ts).
const USER_RELATIONS = new Set(["user", "users"]);
const SAFE_USER_SELECT = { id: true, name: true, role: true, image: true };

type Ctx = { isAdmin: boolean; userId: number };

// `include`/`select` values are either `true` or an object that may carry its
// own nested `include`/`select`, plus `where`/`orderBy`/`take`/`skip`.
type RelationNode = Record<string, unknown>;

function sanitizeRelationMap(map: RelationNode, ctx: Ctx): void {
  for (const key of Object.keys(map)) {
    // `_count` is an aggregate, not a relation payload — leave it alone so
    // dashboard counts keep reflecting totals.
    if (key === "_count") continue;

    const value = map[key];

    if (PRIVATE_RELATIONS.has(key)) {
      if (ctx.isAdmin) {
        descend(value, ctx);
        continue;
      }
      const node: RelationNode = value === true || value == null ? {} : { ...(value as RelationNode) };
      const existingWhere = (node.where ?? {}) as Record<string, unknown>;
      // Spreading our clause last guarantees it wins over any client-supplied
      // `userId`; Prisma ANDs top-level fields, so a crafted OR can't widen it.
      node.where = { ...existingWhere, userId: ctx.userId };
      descend(node, ctx);
      map[key] = node;
      continue;
    }

    if (USER_RELATIONS.has(key)) {
      if (ctx.isAdmin) {
        descend(value, ctx);
        continue;
      }
      map[key] = { select: { ...SAFE_USER_SELECT } };
      continue;
    }

    // Public content relation (verse, topic, chapter, book, author, …):
    // keep it, but recurse so nested private relations are still scoped.
    descend(value, ctx);
  }
}

function descend(value: unknown, ctx: Ctx): void {
  if (!value || typeof value !== "object") return;
  const node = value as RelationNode;
  if (node.include && typeof node.include === "object") {
    sanitizeRelationMap(node.include as RelationNode, ctx);
  }
  if (node.select && typeof node.select === "object") {
    sanitizeRelationMap(node.select as RelationNode, ctx);
  }
}

/**
 * Sanitize a client-supplied Prisma `include` before it reaches the database.
 *
 * The content list/detail endpoints forward an arbitrary `include` straight to
 * Prisma, which lets any authenticated user traverse relations into other
 * users' private notes/highlights/bookmarks and user records. This rewrites the
 * tree so per-user relations are scoped to the caller and user relations are
 * reduced to non-PII fields. Admins are unaffected.
 *
 * Returns the sanitized include (a copy — the input is not mutated).
 */
export async function sanitizeClientInclude<T>(include: T | undefined): Promise<T | undefined> {
  if (!include || typeof include !== "object") return include;

  const session = await getServerAuth();
  const user = session && typeof session !== "boolean" ? session.user : null;
  const ctx: Ctx = {
    isAdmin: user?.role === "ADMIN",
    // Fall back to an id no row can have, so a missing session scopes to nothing.
    userId: user ? Number(user.id) : 0,
  };
  if (ctx.isAdmin) return include;

  const copy =
    typeof structuredClone === "function"
      ? structuredClone(include)
      : JSON.parse(JSON.stringify(include));
  sanitizeRelationMap(copy as RelationNode, ctx);
  return copy as T;
}

// Exported for direct unit testing with an explicit context.
export function sanitizeIncludeForContext<T>(include: T, ctx: Ctx): T {
  if (!include || typeof include !== "object" || ctx.isAdmin) return include;
  const copy =
    typeof structuredClone === "function"
      ? structuredClone(include)
      : JSON.parse(JSON.stringify(include));
  sanitizeRelationMap(copy as RelationNode, ctx);
  return copy as T;
}
