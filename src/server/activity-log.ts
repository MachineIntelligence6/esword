import { ActivityActionType } from "@prisma/client";

const pluralNames: Record<string, string> = {
    Commentary: "commentaries",
};

function modelNoun(model: string, count: number) {
    const singular = model.toLowerCase();
    if (count === 1) return singular;
    return pluralNames[model] ?? `${singular}s`;
}

/**
 * Activity log text, e.g. "Ann created new verse" for a single write or
 * "Ann archived 12 chapters" for a bulk write (`count` = rows affected).
 */
export function describeActivity(
    userName: string,
    action: ActivityActionType,
    model: string,
    count?: number,
): string {
    if (model === "AboutContent") return `${userName} updated about page content`;
    const verb = `${action.toLowerCase()}d`;
    if (count !== undefined) {
        return `${userName} ${verb} ${count.toLocaleString("en-US")} ${modelNoun(model, count)}`;
    }
    return `${userName} ${verb} ${action === "CREATE" ? "new " : ""}${model.toLowerCase()}`;
}

/** "Ann imported 2,994 verses into II Psalms (2,990 new, 4 changed)". */
export function describeImport(
    userName: string,
    bookNames: string[],
    created: number,
    updated: number,
): string {
    const total = created + updated;
    const where = bookNames.length === 1 ? bookNames[0] : `${bookNames.length} books`;
    const parts = [
        created > 0 ? `${created.toLocaleString("en-US")} new` : null,
        updated > 0 ? `${updated.toLocaleString("en-US")} changed` : null,
    ].filter(Boolean);
    const detail = parts.length > 0 ? ` (${parts.join(", ")})` : "";
    return `${userName} imported ${total.toLocaleString("en-US")} ${total === 1 ? "verse" : "verses"} into ${where}${detail}`;
}
