@echo off
setlocal

if "%NEXT_PUBLIC_APP_URL%"=="" set NEXT_PUBLIC_APP_URL=http://127.0.0.1:2616
if "%NEXT_PUBLIC_API_BASE_URL%"=="" set NEXT_PUBLIC_API_BASE_URL=http://1.15.94.158:2617
set NEXT_DIST_DIR=.next-electron-desktop
set NEXT_TELEMETRY_DISABLED=1

powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -LiteralPath '%~dp0..\..\.next-electron-desktop' -Recurse -Force -ErrorAction SilentlyContinue"

cd /d "%~dp0..\.."
call npm.cmd run build -- --webpack
if errorlevel 1 exit /b 1

set RENDERER_DIST_DIR=.next-electron-desktop
cd /d "%~dp0..\.."
node desktop\scripts\copy-renderer.mjs
