import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.platform === "win32") {
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      path.join(__dirname, "prepare-renderer.ps1"),
    ],
    {
      stdio: "inherit",
      env: process.env,
    }
  );
} else {
  execFileSync("bash", [path.join(__dirname, "prepare-renderer.sh")], {
    stdio: "inherit",
    env: process.env,
  });
}
