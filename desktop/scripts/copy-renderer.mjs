import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");
const frontendDir = path.resolve(desktopDir, "..");
const bundleDir = path.join(desktopDir, ".bundle");
const bundleFrontendDir = path.join(bundleDir, "frontend");
const rendererDistDirName =
  process.env.RENDERER_DIST_DIR ?? ".next-electron-desktop";
const rendererBuildDir = path.join(frontendDir, rendererDistDirName);

await rm(bundleDir, { recursive: true, force: true });
await mkdir(bundleFrontendDir, { recursive: true });

await cp(path.join(rendererBuildDir, "standalone"), bundleFrontendDir, {
  recursive: true,
});
await cp(path.join(frontendDir, "public"), path.join(bundleFrontendDir, "public"), {
  recursive: true,
});
await cp(
  path.join(rendererBuildDir, "static"),
  path.join(bundleFrontendDir, ".next", "static"),
  {
    recursive: true,
  }
);
