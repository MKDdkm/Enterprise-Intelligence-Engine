import fs from "node:fs/promises";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), "backend", "data");
const recordsPath = path.join(dataDir, "evidence-records.json");

function parseArgs(argv) {
  const args = {
    keep: 20,
    yes: false,
    dropAll: false,
  };

  for (const part of argv.slice(2)) {
    if (part === "--yes") {
      args.yes = true;
      continue;
    }

    if (part === "--drop-all") {
      args.dropAll = true;
      continue;
    }

    if (part.startsWith("--keep=")) {
      const raw = part.split("=")[1];
      const keep = Number.parseInt(raw, 10);
      if (Number.isFinite(keep) && keep >= 0) {
        args.keep = keep;
      }
    }
  }

  return args;
}

function sortNewestFirst(records) {
  return [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function readRecords() {
  try {
    const content = await fs.readFile(recordsPath, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeRecords(records) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(recordsPath, JSON.stringify(records, null, 2), "utf-8");
}

async function createBackup(records) {
  const backupName = `evidence-records.backup-${Date.now()}.json`;
  const backupPath = path.join(dataDir, backupName);
  await fs.writeFile(backupPath, JSON.stringify(records, null, 2), "utf-8");
  return backupPath;
}

async function main() {
  const options = parseArgs(process.argv);
  const allRecords = await readRecords();
  const sorted = sortNewestFirst(allRecords);
  const keptRecords = options.dropAll ? [] : sorted.slice(0, options.keep);
  const removeCount = sorted.length - keptRecords.length;

  console.log(`[cleanup] Found ${sorted.length} evidence records.`);
  console.log(`[cleanup] Keeping ${keptRecords.length} newest record(s). Removing ${removeCount}.`);
  console.log(`[cleanup] Data file: ${recordsPath}`);

  if (!options.yes) {
    console.log("[cleanup] Dry run only. No files changed.");
    console.log("[cleanup] Re-run with --yes to apply changes.");
    return;
  }

  const backupPath = await createBackup(sorted);
  await writeRecords(keptRecords);

  console.log(`[cleanup] Backup written to: ${backupPath}`);
  console.log("[cleanup] Cleanup complete.");
}

main().catch((error) => {
  console.error("[cleanup] Failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
