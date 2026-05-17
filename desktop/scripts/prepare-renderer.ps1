$ErrorActionPreference = "Stop"

$desktopDir = Split-Path -Parent $PSScriptRoot
$frontendDir = Split-Path -Parent $desktopDir
$frontendEnvPath = Join-Path $frontendDir ".env.production"
$rendererDistDir = ".next-electron-$([DateTimeOffset]::Now.ToUnixTimeMilliseconds())"

function Get-FrontendEnvValue {
  param(
    [string]$Key
  )

  if (-not (Test-Path $frontendEnvPath)) {
    return $null
  }

  $line = Get-Content $frontendEnvPath |
    Where-Object { $_ -match "^\s*$Key=" } |
    Select-Object -First 1

  if (-not $line) {
    return $null
  }

  return ($line -replace "^\s*$Key=", "").Trim().Trim('"')
}

$env:NEXT_DIST_DIR = $rendererDistDir
$env:NEXT_TELEMETRY_DISABLED = "1"
if (-not $env:NEXT_PUBLIC_APP_URL) {
  $env:NEXT_PUBLIC_APP_URL = (Get-FrontendEnvValue "NEXT_PUBLIC_APP_URL")
}
if (-not $env:NEXT_PUBLIC_APP_URL) {
  $env:NEXT_PUBLIC_APP_URL = "http://127.0.0.1:2616"
}
if (-not $env:NEXT_PUBLIC_API_BASE_URL) {
  $env:NEXT_PUBLIC_API_BASE_URL = (Get-FrontendEnvValue "NEXT_PUBLIC_API_BASE_URL")
}
if (-not $env:NEXT_PUBLIC_API_BASE_URL) {
  $env:NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:2617"
}

Push-Location $frontendDir
try {
  & npm.cmd run build -- --webpack
} finally {
  Pop-Location
}

$env:RENDERER_DIST_DIR = $rendererDistDir
& node (Join-Path $PSScriptRoot "copy-renderer.mjs")

Remove-Item -LiteralPath (Join-Path $frontendDir $rendererDistDir) -Recurse -Force -ErrorAction SilentlyContinue
