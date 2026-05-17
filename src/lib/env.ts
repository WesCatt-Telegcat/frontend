function readEnv(value: string | undefined, fallback: string) {
  const normalized = value?.trim()

  return normalized ? normalized : fallback
}

function deriveApiBaseUrl(appBaseUrl: string) {
  try {
    const url = new URL(appBaseUrl)

    if (url.port === "2616") {
      url.port = "2617"
    }

    return url.toString().replace(/\/$/, "")
  } catch {
    return "http://localhost:2617"
  }
}

export const APP_BASE_URL = readEnv(
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:2616"
)

export const API_BASE_URL = readEnv(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  deriveApiBaseUrl(APP_BASE_URL)
)
