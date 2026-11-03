#!/usr/bin/env bash
# Deploys main to production. The website runs as the unprivileged account esword, which owns
# APP_DIR. This script runs as the operator account (mi6support) and hands every step that runs
# code from the repository to esword. Run it from a copy esword cannot edit:
#   ssh -i ~/.ssh/id_ed25519 mi6support@2.29.28.247 'bash -s' < scripts/deploy-production.sh
#   esword-deploy    (on the server: the root-owned copy in /usr/local/sbin, see DEPLOY.md)
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/esword}"
APP_USER="${APP_USER:-esword}"
REPO_URL="${REPO_URL:-https://github.com/MachineIntelligence6/esword.git}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-esword}"
BACKUP_DIR="${BACKUP_DIR:-${HOME}/backups/esword}"
ALLOW_INSTALL_SCRIPTS="${ALLOW_INSTALL_SCRIPTS:-}"
TS="$(date +%Y%m%d-%H%M%S)"
SELF="${BASH_SOURCE[0]:-}"

# Refuses a checkout carrying the worm force-pushed to our GitHub repos on 2026-11-02
# (an api.js loader, "node api.js" in package.json scripts, code hidden after a run of
# tabs in *.config.js) or other common supply-chain implants. It runs before anything from
# the new checkout is copied into APP_DIR or executed.
# After reviewing a dependency's install script, approve it with ALLOW_INSTALL_SCRIPTS="name".
check_source_tree() {
  local src="$1" problems="" f len run node_out
  # Payload markers and C2 hosts; the brackets keep this file from matching itself.
  local sig='rmcej%ot[b]%|8-1638-[2]|Cot%3t=sht[P]|/0x/cl[s]|95\.135\.181\.15[1]|193\.32\.204\.19[9]|166\.88\.73\.4[6]|166\.88\.134\.6[2]'
  flag() { problems="${problems}  - $*"$'\n'; }

  while IFS= read -r f; do flag "unexpected loader file ${f#"$src"/}"; done \
    < <(find "$src" -path "$src/.git" -prune -o -type f -name api.js -print)
  while IFS= read -r f; do flag "known malware marker in ${f#"$src"/}"; done \
    < <(grep -rIlE "$sig" "$src" --exclude-dir=.git || true)
  while IFS= read -r f; do
    len=$(awk '{ if (length > m) m = length } END { print m + 0 }' "$f")
    run=$( (grep -oE '[[:blank:]]+' "$f" || true) | awk '{ if (length > m) m = length } END { print m + 0 }')
    if [ "$len" -gt 400 ] || [ "$run" -ge 60 ]; then
      flag "${f#"$src"/} hides code (longest line ${len}, longest blank run ${run})"
    fi
  done < <(find "$src" -path "$src/.git" -prune -o -type f \( -name '*.config.js' -o -name '*.config.mjs' \
             -o -name '*.config.cjs' -o -name '*.config.ts' -o -name '.eslintrc*' \) -print)
  while IFS= read -r f; do
    if grep -q folderOpen "$f"; then flag "${f#"$src"/} runs a task when the folder is opened"; fi
  done < <(find "$src" -path "$src/.git" -prune -o -path '*/.vscode/tasks.json' -print)
  while IFS= read -r f; do
    if grep -Iq . "$f"; then flag "${f#"$src"/} is a font file that contains text"; fi
  done < <(find "$src" -path "$src/.git" -prune -o -type f \( -iname '*.woff' -o -iname '*.woff2' \
             -o -iname '*.ttf' -o -iname '*.otf' -o -iname '*.eot' \) -print)

  # Scripts this deploy runs, and dependencies npm ci would fetch or execute.
  node_out=$(SRC="$src" ALLOW="${ALLOW_INSTALL_SCRIPTS:-}" node <<'NODE'
const fs = require("fs");
const path = require("path");
const read = (f) => JSON.parse(fs.readFileSync(path.join(process.env.SRC, f), "utf8"));
const out = [];
const scripts = read("package.json").scripts || {};
for (const name of ["preinstall", "install", "postinstall", "prepare", "premigrate", "migrate",
  "postmigrate", "prebuild", "build", "postbuild", "prestart", "start", "poststart"]) {
  const cmd = scripts[name];
  if (cmd && /\b(node|bun|curl|wget)\b|api\.js|\|\s*(ba)?sh\b/.test(cmd)) {
    out.push(`package.json script "${name}" runs: ${cmd}`);
  }
}
const allowed = new Set(["", "prisma", "@prisma/client", "@prisma/engines", "fsevents", "unrs-resolver",
  ...process.env.ALLOW.split(/[\s,]+/).filter(Boolean)]);
for (const [key, pkg] of Object.entries(read("package-lock.json").packages || {})) {
  const name = key.split("node_modules/").pop();
  if (pkg.resolved && !pkg.resolved.startsWith("https://registry.npmjs.org/")) {
    out.push(`package-lock.json: ${name} is fetched from ${pkg.resolved}`);
  }
  if (pkg.hasInstallScript && !allowed.has(name)) {
    out.push(`package-lock.json: ${name}@${pkg.version} runs an install script (review it, then rerun with ALLOW_INSTALL_SCRIPTS="${name}")`);
  }
}
if (out.length) console.log(out.join("\n"));
NODE
  ) || node_out="could not read package.json or package-lock.json"
  if [ -n "$node_out" ]; then
    while IFS= read -r f; do flag "$f"; done <<< "$node_out"
  fi

  if [ -n "$problems" ]; then
    printf '\n!! Refusing to deploy %s: the checkout looks infected.\n%s' \
      "$(git -C "$src" log -1 --format='%h' 2>/dev/null)" "$problems" >&2
    printf '!! Nothing was copied into %s and the running app is unchanged. Inspect %s.\n' "$APP_DIR" "$src" >&2
    return 1
  fi
  echo "Malware check passed"
}

# Writes a gzipped dump of the app's database to stdout. Runs as APP_USER.
dump_database() {
  set -a
  # shellcheck disable=SC1091
  . "${APP_DIR}/.env"
  set +a
  node <<'NODE'
const { spawn } = require("child_process");
const zlib = require("zlib");
const url = new URL(process.env.DATABASE_URL);
const user = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const host = url.hostname || "127.0.0.1";
const port = url.port || "3306";
const db = url.pathname.replace(/^\//, "");
console.error(`Backing up ${db}@${host}:${port}`);
const dump = spawn(
  "mysqldump",
  [
    `-h${host}`,
    `-P${port}`,
    `-u${user}`,
    `-p${password}`,
    "--single-transaction",
    "--routines",
    "--triggers",
    db,
  ],
  { stdio: ["ignore", "pipe", "pipe"] }
);
dump.stdout.pipe(zlib.createGzip()).pipe(process.stdout);
let err = "";
dump.stderr.on("data", (d) => {
  err += d.toString();
});
dump.on("close", (code) => {
  if (code !== 0) {
    console.error(err.replaceAll(password, "***"));
    process.exit(code || 1);
  }
});
NODE
}

# Fetches, checks, installs, builds and restarts the app. Runs as APP_USER, so code from the
# repository and its dependencies get that account's rights and nothing more.
deploy_as_app() {
  local src="${HOME}/deploy/src" keep="${HOME}/deploy/preserve"
  set -a
  # shellcheck disable=SC1091
  . "${APP_DIR}/.env"
  set +a

  rm -rf "$keep"
  mkdir -p "$keep/blogs-images" "$keep/logs"
  if [ -d "${APP_DIR}/public/blogs-images" ]; then
    rsync -a "${APP_DIR}/public/blogs-images/" "$keep/blogs-images/"
  fi
  if [ -d "${APP_DIR}/logs" ]; then
    rsync -a "${APP_DIR}/logs/" "$keep/logs/" || true
  fi

  rm -rf "$src"
  git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "$src"
  echo "==> Checking $(git -C "$src" log -1 --format='%h "%s" by %an') for malware"
  check_source_tree "$src"

  rsync -a --delete \
    --exclude '.env' \
    --exclude 'node_modules/' \
    --exclude 'build/' \
    --exclude '.next/' \
    --exclude 'logs/' \
    --exclude 'public/blogs-images/' \
    --exclude '.git/' \
    "$src/" "${APP_DIR}/"

  mkdir -p "${APP_DIR}/public/blogs-images" "${APP_DIR}/logs"
  rsync -a "$keep/blogs-images/" "${APP_DIR}/public/blogs-images/"
  rsync -a "$keep/logs/" "${APP_DIR}/logs/" || true
  rm -rf "${APP_DIR}/.git"
  cp -a "$src/.git" "${APP_DIR}/.git"

  cd "${APP_DIR}"
  # Restore any blog images tracked in git that may be missing on disk
  git checkout HEAD -- public/blogs-images 2>/dev/null || true

  # Vulnerability checks run in CI (scripts/audit-gate.mjs), which fails on any
  # high/critical advisory not explicitly accepted; skip the duplicate report here.
  npm ci --no-audit
  npm run migrate
  NODE_ENV=production npm run build
  pm2 restart "${PM2_NAME}" --update-env
  pm2 save
  sleep 2

  curl -fsS http://127.0.0.1:3000/api/health
  echo
  curl -fsS https://apocryphalwritings.org/api/health
  echo
  echo "Deployed $(git rev-parse --short HEAD) $(git log -1 --oneline)"
}

# Runs one of the functions above as APP_USER, using this file's copy of them.
as_app() {
  (cd / && sudo -n -u "${APP_USER}" -H bash -c "set -euo pipefail
$(declare -p APP_DIR REPO_URL BRANCH PM2_NAME ALLOW_INSTALL_SCRIPTS)
$(declare -f check_source_tree dump_database deploy_as_app)
$1" </dev/null)
}

main() {
  refuse() { printf '!! %s\n' "$*" >&2; exit 1; }
  # Anything this account runs must be out of the website's reach, or a break-in through the
  # site could edit it and gain this account's admin rights on the next deploy.
  [ "$(id -un)" != "${APP_USER}" ] || refuse "Run this as the operator account, not as ${APP_USER}."
  if [ -n "$SELF" ] && [ -f "$SELF" ]; then
    case "$(readlink -f "$SELF")" in
      "$(readlink -f "${APP_DIR}")"/*)
        refuse "Not running the copy in ${APP_DIR}, which ${APP_USER} can edit. Run esword-deploy, or pipe the script from a checkout (see DEPLOY.md)." ;;
    esac
    [ "$(stat -c %U "$SELF")" != "${APP_USER}" ] || refuse "${SELF} is owned by ${APP_USER}; run esword-deploy instead."
  fi
  id "${APP_USER}" >/dev/null 2>&1 || refuse "The account ${APP_USER} does not exist (see DEPLOY.md)."

  echo "==> Deploying ${BRANCH} into ${APP_DIR} as ${APP_USER} (${TS})"
  # The backup is written by this account, where the website can neither read nor delete it.
  local backup="${BACKUP_DIR}/esword-pre-deploy-${TS}.sql.gz"
  if ! (umask 077 && mkdir -p "${BACKUP_DIR}" && as_app dump_database > "$backup") || ! gzip -t "$backup"; then
    rm -f "$backup"
    refuse "Database backup failed; nothing was changed."
  fi
  echo "DB backup OK: $backup"

  as_app deploy_as_app
  echo "DONE"
}

main "$@"
