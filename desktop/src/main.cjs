const { app, BrowserWindow, dialog, shell } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");

const APP_PORT = Number(process.env.DESKTOP_APP_PORT ?? 2616);
const APP_URL = `http://127.0.0.1:${APP_PORT}`;
const RELEASE_API_URL =
  "https://api.github.com/repos/WesCatt-Telegcat/frontend/releases/latest";
const isDev = !app.isPackaged;

let rendererProcess = null;

function rendererScriptPath() {
  if (isDev) {
    return path.join(__dirname, "..", ".bundle", "frontend", "server.js");
  }

  return path.join(process.resourcesPath, "frontend", "server.js");
}

function rendererAppRoot() {
  return path.dirname(rendererScriptPath());
}

function startRendererServer() {
  const script = rendererScriptPath();

  rendererProcess = spawn(process.execPath, [script], {
    cwd: rendererAppRoot(),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NEXT_PRIVATE_STANDALONE: "true",
      NODE_ENV: "production",
      PORT: String(APP_PORT),
      HOSTNAME: "127.0.0.1",
    },
    stdio: "inherit",
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  for (;;) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {}

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`Timed out waiting for ${url}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

function normalizeVersion(version) {
  return String(version ?? "")
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));
}

function isNewerVersion(latestVersion, currentVersion) {
  const latestParts = normalizeVersion(latestVersion);
  const currentParts = normalizeVersion(currentVersion);
  const length = Math.max(latestParts.length, currentParts.length);

  for (let index = 0; index < length; index += 1) {
    const latestPart = latestParts[index] ?? 0;
    const currentPart = currentParts[index] ?? 0;

    if (latestPart > currentPart) {
      return true;
    }

    if (latestPart < currentPart) {
      return false;
    }
  }

  return false;
}

async function checkForUpdates(window) {
  if (isDev) {
    return;
  }

  try {
    const response = await fetch(RELEASE_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": `Telecat-Desktop/${app.getVersion()}`,
      },
    });

    if (!response.ok) {
      return;
    }

    const release = await response.json();
    const latestVersion = release?.tag_name;
    const releaseUrl = release?.html_url;
    const currentVersion = app.getVersion();

    if (
      !latestVersion ||
      !releaseUrl ||
      !isNewerVersion(latestVersion, currentVersion)
    ) {
      return;
    }

    const { response: action } = await dialog.showMessageBox(window, {
      type: "info",
      title: "发现新版本",
      message: `发现新版本 ${latestVersion}`,
      detail: `当前版本 ${currentVersion}，是否前往 GitHub Release 页面下载更新？`,
      buttons: ["稍后", "前往下载"],
      cancelId: 0,
      defaultId: 1,
      noLink: true,
    });

    if (action === 1) {
      await shell.openExternal(releaseUrl);
    }
  } catch (error) {
    console.error("Failed to check for desktop updates:", error);
  }
}

async function createWindow() {
  startRendererServer();
  await waitForServer(APP_URL);

  const window = new BrowserWindow({
    width: 1400,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#111111",
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  await window.loadURL(APP_URL);

  return window;
}

app.whenReady().then(async () => {
  try {
    const window = await createWindow();
    void checkForUpdates(window);
  } catch (error) {
    console.error(error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (rendererProcess) {
    rendererProcess.kill();
    rendererProcess = null;
  }
});
