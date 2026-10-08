// CI gate: fail on any high/critical `npm audit` advisory that is not explicitly accepted below.
// Run with: node scripts/audit-gate.mjs
import { spawnSync } from "node:child_process";

// Accepted advisories. Each needs a reason; remove the entry once a fix exists.
const ACCEPTED = {
  "GHSA-vfj7-8cjw-p6xm": {
    package: "braces",
    reason:
      "ReDoS in glob brace expansion. No patched release exists (3.0.3 is the latest braces). " +
      "Only reachable through build-time tools (tailwindcss, eslint-config-next) matching our own " +
      "file patterns, never user input. Revisit when migrating to Tailwind 4.",
  },
};

const res = spawnSync("npm", ["audit", "--json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
let report;
try {
  report = JSON.parse(res.stdout);
} catch {
  console.error("Could not parse `npm audit --json` output:\n", res.stdout || res.stderr);
  process.exit(2);
}

const failing = new Map();
const accepted = new Map();
for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    if (typeof via === "string") continue;
    if (via.severity !== "high" && via.severity !== "critical") continue;
    const id = via.url?.split("/").pop() ?? String(via.source);
    const bucket = ACCEPTED[id] ? accepted : failing;
    if (!bucket.has(id)) bucket.set(id, { id, severity: via.severity, title: via.title, packages: new Set() });
    bucket.get(id).packages.add(name);
  }
}

for (const a of accepted.values()) {
  console.log(`accepted ${a.severity} ${a.id} (${[...a.packages].join(", ")}): ${ACCEPTED[a.id].reason}`);
}
if (failing.size > 0) {
  console.error("\nUnaccepted high/critical advisories:");
  for (const f of failing.values()) {
    console.error(`  ${f.severity} ${f.id} ${f.title} [${[...f.packages].join(", ")}]`);
  }
  process.exit(1);
}
console.log("\nAudit gate passed: no unaccepted high/critical advisories.");
