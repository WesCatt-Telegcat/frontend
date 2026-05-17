# Telecat Desktop

Desktop packaging uses Electron + electron-builder with the Next.js standalone output.

## Install

```bash
cd frontend/desktop
npm install
```

## Local build

Use the one-click scripts in [`package.json`](./package.json).

Windows PowerShell:

```powershell
$env:NEXT_PUBLIC_API_BASE_URL="https://api.example.com"
npm run dist:win
```

macOS:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com \
npm run dist:mac
```

## Renderer API base URL

Desktop packaging reads values in this order:

- shell environment variables you pass manually
- `../.env.production`
- fallback defaults:
  - `NEXT_PUBLIC_APP_URL=http://127.0.0.1:2616`
  - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:2617`

If you already maintain deployment addresses in `frontend/.env.production`, desktop packaging will reuse them automatically.
