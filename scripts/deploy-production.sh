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

npm ci
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
