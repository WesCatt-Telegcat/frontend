import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");
const frontendDir = path.resolve(desktopDir, "..");
const desktopPackagePath = path.join(desktopDir, "package.json");
const frontendPackagePath = path.join(frontendDir, "package.json");

function normalizeVersion(version) {
  return String(version ?? "").trim().replace(/^v/i, "");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

const desktopPackage = await readJson(desktopPackagePath);
const frontendPackage = await readJson(frontendPackagePath);
const nextVersion = normalizeVersion(
  process.env.RELEASE_VERSION || frontendPackage.version || desktopPackage.version
);

if (!nextVersion) {
  throw new Error("Unable to resolve desktop package version");
}

if (desktopPackage.version !== nextVersion) {
  desktopPackage.version = nextVersion;
  await writeFile(
    desktopPackagePath,
    `${JSON.stringify(desktopPackage, null, 2)}\n`,
    "utf8"
  );
}

process.stdout.write(`desktop version -> ${nextVersion}\n`);
