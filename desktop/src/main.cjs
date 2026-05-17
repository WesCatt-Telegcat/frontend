const { app, BrowserWindow } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");

const APP_PORT = Number(process.env.DESKTOP_APP_PORT ?? 2616);
const APP_URL = `http://127.0.0.1:${APP_PORT}`;
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
}

app.whenReady().then(async () => {
  try {
    await createWindow();
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
