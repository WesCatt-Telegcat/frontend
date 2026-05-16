import type {
  AuthResponse,
  EncryptedMessage,
  FriendConversation,
  FriendRequest,
  FriendSearchResult,
  DonationOrder,
  PaymentMethods,
  SendEncryptedMessageInput,
  User,
} from "@/lib/types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:2617"

type ApiEnvelope<T> = {
  code: number
  message: string
  data: T
}

export const tokenStore = {
  get() {
    if (typeof window === "undefined") {
      return null
    }

    return window.localStorage.getItem("telecat_token")
  },
  set(token: string) {
    window.localStorage.setItem("telecat_token", token)
  },
  clear() {
    window.localStorage.removeItem("telecat_token")
    window.localStorage.removeItem("telecat_user")
  },
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStore.get()
  const headers = new Headers(options.headers)

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  const text = await response.text()
  let payload: ApiEnvelope<T> | null = null

  try {
    payload = text ? (JSON.parse(text) as ApiEnvelope<T>) : null
  } catch {
    if (!response.ok) {
      throw new Error(text || response.statusText)
    }
  }

  if (!response.ok || (payload && payload.code >= 400)) {
    throw new Error(payload?.message ?? response.statusText)
  }

  return payload?.data as T
}

export const authApi = {
  sendCode(email: string) {
    return apiFetch<{ email: string; expiresIn: number; resendIn: number }>(
      "/auth/send-code",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    )
  },
  register(input: {
    email: string
    name: string
    password: string
    code: string
    encryptionPublicKey: string
  }) {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  login(input: { email: string; password: string; encryptionPublicKey: string }) {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  me() {
    return apiFetch<User>("/auth/me")
  },
  syncEncryptionKey(encryptionPublicKey: string) {
    return apiFetch<User>("/auth/me/encryption-key", {
      method: "POST",
      body: JSON.stringify({ encryptionPublicKey }),
    })
  },
}

export const friendsApi = {
  list() {
    return apiFetch<FriendConversation[]>("/friends")
  },
  search(friendCode: string) {
    return apiFetch<FriendSearchResult>(
      `/friends/search/${encodeURIComponent(friendCode)}`
    )
  },
  request(friendCode: string) {
    return apiFetch("/friends/requests", {
      method: "POST",
      body: JSON.stringify({ friendCode }),
    })
  },
  addByLink(link: string) {
    return apiFetch("/friends/link", {
      method: "POST",
      body: JSON.stringify({ link }),
    })
  },
  incomingRequests() {
    return apiFetch<FriendRequest[]>("/friends/requests/incoming")
  },
  respond(requestId: string, accept: boolean) {
    return apiFetch(`/friends/requests/${requestId}/respond`, {
      method: "POST",
      body: JSON.stringify({ accept }),
    })
  },
}

export const messagesApi = {
  list(friendId: string) {
    return apiFetch<EncryptedMessage[]>(`/messages/${friendId}`)
  },
  send(friendId: string, input: SendEncryptedMessageInput) {
    return apiFetch<EncryptedMessage>(`/messages/${friendId}`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
}

export const paymentsApi = {
  methods() {
    return apiFetch<PaymentMethods>("/payments/methods")
  },
  createOrder(input: {
    provider: "ALIPAY" | "WECHAT"
    amountFen: number
    title?: string
  }) {
    return apiFetch<DonationOrder>("/payments/orders", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  getOrder(orderId: string) {
    return apiFetch<DonationOrder>(`/payments/orders/${orderId}`)
  },
}
