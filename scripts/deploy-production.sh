#!/usr/bin/env bash
# Run ON the production host as mi6support from anywhere:
#   bash /var/www/esword/scripts/deploy-production.sh
# Or after SSH:
#   ssh -i ~/.ssh/id_ed25519 mi6support@2.29.28.247 'bash -s' < scripts/deploy-production.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/esword}"
REPO_URL="${REPO_URL:-https://github.com/MachineIntelligence6/esword.git}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-esword}"
TS="$(date +%Y%m%d-%H%M%S)"

# Refuses a checkout carrying the worm force-pushed to our GitHub repos on 2026-11-02
# (an api.js loader, "node api.js" in package.json scripts, code hidden after a run of
# tabs in *.config.js) or other common supply-chain implants. It runs from the copy already
# on this server, before anything from the new checkout is copied into APP_DIR or executed.
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

echo "==> Deploying ${BRANCH} into ${APP_DIR} (${TS})"

mkdir -p "${HOME}/backups/esword" /tmp/esword-preserve-"${TS}"
ln -sfn /tmp/esword-preserve-"${TS}" /tmp/esword-preserve-latest

cp -a "${APP_DIR}/.env" /tmp/esword-preserve-latest/.env
mkdir -p /tmp/esword-preserve-latest/blogs-images /tmp/esword-preserve-latest/logs
if [ -d "${APP_DIR}/public/blogs-images" ]; then
  rsync -a "${APP_DIR}/public/blogs-images/" /tmp/esword-preserve-latest/blogs-images/
fi
if [ -d "${APP_DIR}/logs" ]; then
  rsync -a "${APP_DIR}/logs/" /tmp/esword-preserve-latest/logs/ || true
fi

set -a
# shellcheck disable=SC1091
. "${APP_DIR}/.env"
set +a
export TS
node <<'NODE'
const { spawn } = require("child_process");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const url = new URL(process.env.DATABASE_URL);
const user = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const host = url.hostname || "127.0.0.1";
const port = url.port || "3306";
const db = url.pathname.replace(/^\//, "");
const out = path.join(
  process.env.HOME,
  "backups/esword",
  `esword-pre-deploy-${process.env.TS}.sql.gz`
);
console.log(`Backing up ${db}@${host}:${port}`);
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
const gzip = zlib.createGzip();
const file = fs.createWriteStream(out);
dump.stdout.pipe(gzip).pipe(file);
let err = "";
dump.stderr.on("data", (d) => {
  err += d.toString();
});
dump.on("close", (code) => {
  if (code !== 0) {
    console.error(err.replaceAll(password, "***"));
    process.exit(code || 1);
  }
  console.log("DB backup OK:", out);
});
NODE

rm -rf /tmp/esword-src
git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" /tmp/esword-src
echo "==> Checking $(git -C /tmp/esword-src log -1 --format='%h "%s" by %an') for malware"
check_source_tree /tmp/esword-src

rsync -a --delete \
  --exclude '.env' \
  --exclude 'node_modules/' \
  --exclude 'build/' \
  --exclude '.next/' \
  --exclude 'logs/' \
  --exclude 'public/blogs-images/' \
  --exclude '.git/' \
  /tmp/esword-src/ "${APP_DIR}/"

cp -a /tmp/esword-preserve-latest/.env "${APP_DIR}/.env"
mkdir -p "${APP_DIR}/public/blogs-images" "${APP_DIR}/logs"
rsync -a /tmp/esword-preserve-latest/blogs-images/ "${APP_DIR}/public/blogs-images/"
rsync -a /tmp/esword-preserve-latest/logs/ "${APP_DIR}/logs/" || true
rm -rf "${APP_DIR}/.git"
cp -a /tmp/esword-src/.git "${APP_DIR}/.git"

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
echo "DONE"
