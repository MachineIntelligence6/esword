// Defense-in-depth: strip the User.password hash from query results so it can
// never escape the data layer through a relation. Several read endpoints pass a
// client-supplied Prisma `include` straight to findMany/findFirst, so an
// authenticated user can traverse relations down to the User model
// (e.g. verse -> notes -> user) and read every user's bcrypt hash.
//
// We scrub `password` from every nested record, but keep it on the *root*
// records of a direct User query so credential checks (login, verify-password,
// change-password) that read `user.password` keep working.
export function scrubPasswords(node: unknown, keepOwnPassword: boolean): void {
  if (Array.isArray(node)) {
    for (const item of node) scrubPasswords(item, keepOwnPassword);
    return;
  }
  if (!node || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  if (!keepOwnPassword && "password" in record) {
    delete record.password;
  }
  for (const [key, value] of Object.entries(record)) {
    if (key === "password") continue;
    if (value && typeof value === "object") {
      // Relations are never the root User record, so always scrub them.
      scrubPasswords(value, false);
    }
  }
}
