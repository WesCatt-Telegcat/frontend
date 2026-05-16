"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/components/auth/session-provider"
import { FriendRequestRealtimeAlert } from "@/components/notification/FriendRequestRealtimeAlert"
import { friendsApi, messagesApi, tokenStore } from "@/lib/api"
import {
  decryptConversationPreview,
  decryptMessageFromFriend,
  encryptMessageForFriend,
} from "@/lib/e2ee"
import { createRealtimeSocket } from "@/lib/realtime"
import type {
  FriendConversation,
  FriendRequest,
  FriendSearchResult,
  MessageDeliveryStatus,
  MessagePage,
  Message,
} from "@/lib/types"

type ChatContextValue = {
  friends: FriendConversation[]
  requests: FriendRequest[]
  selectedFriendId: string | null
  selectedFriend: FriendConversation | null
  messages: Message[]
  firstMessageItemIndex: number
  hasOlderMessages: boolean
  hasNewerMessages: boolean
  loadingOlderMessages: boolean
  loadingNewerMessages: boolean
  pendingNewerCount: number
  loading: boolean
  setSelectedFriendId: (id: string | null) => void
  setConversationVisible: (visible: boolean) => void
  setConversationAtBottom: (atBottom: boolean) => void
  acknowledgeCurrentConversation: () => Promise<void>
  loadOlderMessages: () => Promise<void>
  loadNewerMessages: () => Promise<void>
  refresh: () => Promise<void>
  searchFriend: (friendCode: string) => Promise<FriendSearchResult>
  sendFriendRequest: (friendCode: string) => Promise<void>
  addFriendByLink: (link: string) => Promise<void>
  respondRequest: (requestId: string, accept: boolean) => Promise<void>
  sendMessage: (content: string) => void
  resendMessage: (messageId: string) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

type PresenceSnapshot = {
  userIds: string[]
}

type PresenceUpdate = {
  userId: string
  online: boolean
}

type RealtimeMessage = {
  id: string
  sequence: string
  senderId: string
  receiverId: string
  encryptedContent: string
  encryptionIv: string
  encryptionVersion: string
  createdAt: string
}

type ConversationWindowState = {
  friendId: string | null
  items: Message[]
  firstItemIndex: number
  oldestCursor: string | null
  newestCursor: string | null
  hasOlder: boolean
  hasNewer: boolean
  pendingNewerCount: number
  loadingOlder: boolean
  loadingNewer: boolean
}

const INITIAL_MESSAGE_ITEM_INDEX = 100000
const MESSAGE_PAGE_SIZE = 30

function createOptimisticMessage(
  userId: string,
  friendId: string,
  content: string,
  status: MessageDeliveryStatus,
  createdAt = new Date().toISOString(),
  id = `local-${crypto.randomUUID()}`
): Message {
  return {
    id,
    sequence: id,
    senderId: userId,
    receiverId: friendId,
    encryptedContent: "",
    encryptionIv: "",
    encryptionVersion: "v1",
    createdAt,
    isMe: true,
    content,
    deliveryStatus: status,
    isNew: true,
  }
}

function createEmptyConversationWindow(): ConversationWindowState {
  return {
    friendId: null,
    items: [],
    firstItemIndex: INITIAL_MESSAGE_ITEM_INDEX,
    oldestCursor: null,
    newestCursor: null,
    hasOlder: false,
    hasNewer: false,
    pendingNewerCount: 0,
    loadingOlder: false,
    loadingNewer: false,
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useSession()
  const [friends, setFriends] = useState<FriendConversation[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [selectedFriendId, setSelectedFriendIdState] = useState<string | null>(
    null
  )
  const [conversationVisible, setConversationVisibleState] = useState(false)
  const [conversationAtBottom, setConversationAtBottomState] = useState(true)
  const [conversationWindow, setConversationWindow] = useState<ConversationWindowState>(
    createEmptyConversationWindow()
  )
  const [loading, setLoading] = useState(true)
  const [friendRequestAlerts, setFriendRequestAlerts] = useState<FriendRequest[]>([])
  const friendsRef = useRef<FriendConversation[]>([])
  const selectedFriendIdRef = useRef<string | null>(null)
  const conversationVisibleRef = useRef(false)
  const conversationAtBottomRef = useRef(true)
  const conversationWindowRef = useRef<ConversationWindowState>(createEmptyConversationWindow())

  useEffect(() => {
    friendsRef.current = friends
  }, [friends])

  useEffect(() => {
    selectedFriendIdRef.current = selectedFriendId
  }, [selectedFriendId])

  useEffect(() => {
    conversationVisibleRef.current = conversationVisible
  }, [conversationVisible])

  useEffect(() => {
    conversationAtBottomRef.current = conversationAtBottom
  }, [conversationAtBottom])

  useEffect(() => {
    conversationWindowRef.current = conversationWindow
  }, [conversationWindow])

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedFriendId) ?? null,
    [friends, selectedFriendId]
  )

  const updateConversationWindow = useCallback(
    (
      updater:
        | ConversationWindowState
        | ((current: ConversationWindowState) => ConversationWindowState)
    ) => {
      setConversationWindow((current) => {
        const next =
          typeof updater === "function" ? updater(current) : updater

        conversationWindowRef.current = next

        return next
      })
    },
    []
  )

  const markFriendRead = useCallback((friendId: string) => {
    setFriends((current) => {
      let changed = false
      const nextFriends = current.map((friend) =>
        friend.id === friendId && friend.unread > 0
          ? ((changed = true), { ...friend, unread: 0 })
          : friend
      )

      if (!changed) {
        return current
      }

      friendsRef.current = nextFriends

      return nextFriends
    })
  }, [])

  const decryptMessages = useCallback(
    async (friendId: string, page: MessagePage) => {
      if (!user) {
        return []
      }

      const friend = friendsRef.current.find((item) => item.id === friendId)

      if (!friend) {
        return []
      }

      return Promise.all(
        page.items.map((message) => decryptMessageFromFriend(user, friend, message))
      )
    },
    [user]
  )

  const loadConversationPage = useCallback(
    async (
      friendId: string,
      direction: "initial" | "older" | "newer",
      options?: {
        consumePending?: boolean
      }
    ) => {
      if (!user) {
        return
      }

      const windowState = conversationWindowRef.current

      if (direction === "older") {
        if (windowState.loadingOlder || !windowState.hasOlder || !windowState.oldestCursor) {
          return
        }

        updateConversationWindow((current) => ({
          ...current,
          loadingOlder: true,
        }))
      } else if (direction === "newer") {
        if (windowState.loadingNewer || !windowState.hasNewer || !windowState.newestCursor) {
          return
        }

        updateConversationWindow((current) => ({
          ...current,
          loadingNewer: true,
        }))
      }

      const page = await messagesApi.list(friendId, {
        direction: direction === "initial" ? undefined : direction,
        cursor:
          direction === "older"
            ? conversationWindowRef.current.oldestCursor
            : direction === "newer"
              ? conversationWindowRef.current.newestCursor
              : undefined,
        limit: MESSAGE_PAGE_SIZE,
      })
      const decryptedMessages = await decryptMessages(friendId, page)

      updateConversationWindow((current) => {
        if (direction === "initial") {
          return {
            friendId,
            items: decryptedMessages,
            firstItemIndex: INITIAL_MESSAGE_ITEM_INDEX - decryptedMessages.length,
            oldestCursor: page.page.oldestCursor,
            newestCursor: page.page.newestCursor,
            hasOlder: page.page.hasOlder,
            hasNewer: page.page.hasNewer,
            pendingNewerCount: 0,
            loadingOlder: false,
            loadingNewer: false,
          }
        }

        if (direction === "older") {
          return {
            ...current,
            items: [...decryptedMessages, ...current.items],
            firstItemIndex: current.firstItemIndex - decryptedMessages.length,
            oldestCursor: page.page.oldestCursor,
            hasOlder: page.page.hasOlder,
            loadingOlder: false,
          }
        }

        return {
          ...current,
          items: [...current.items, ...decryptedMessages],
          newestCursor: page.page.newestCursor,
          hasNewer: page.page.hasNewer,
          pendingNewerCount: options?.consumePending
            ? Math.max(0, current.pendingNewerCount - decryptedMessages.length)
            : current.pendingNewerCount,
          loadingNewer: false,
        }
      })

      if (
        selectedFriendIdRef.current === friendId &&
        conversationVisibleRef.current
      ) {
        markFriendRead(friendId)
      }
    },
    [decryptMessages, markFriendRead, updateConversationWindow, user]
  )

  const hydrateFriendPreviews = useCallback(
    async (items: FriendConversation[]) => {
      if (!user) {
        return items
      }

      const nextFriends = await Promise.all(
        items.map(async (friend) => ({
          ...friend,
          lastMessage: await decryptConversationPreview(user, friend),
        }))
      )

      return nextFriends
    },
    [user]
  )

  const refresh = useCallback(async () => {
    const [nextFriends, nextRequests] = await Promise.all([
      friendsApi.list(),
      friendsApi.incomingRequests(),
    ])
    const hydratedFriends = await hydrateFriendPreviews(nextFriends)

    setFriends(hydratedFriends)
    friendsRef.current = hydratedFriends
    setRequests(nextRequests)
    setSelectedFriendIdState((current) => {
      if (current && hydratedFriends.some((friend) => friend.id === current)) {
        return current
      }

      return null
    })
    setLoading(false)
  }, [hydrateFriendPreviews])

  const acknowledgeCurrentConversation = useCallback(async () => {
    const friendId = selectedFriendIdRef.current

    if (!friendId) {
      return
    }

    await messagesApi.markRead(friendId)
    markFriendRead(friendId)
    updateConversationWindow((current) =>
      current.friendId === friendId
        ? {
            ...current,
            pendingNewerCount: 0,
          }
        : current
    )
    await refresh()
  }, [markFriendRead, refresh, updateConversationWindow])

  useEffect(() => {
    queueMicrotask(() => void refresh())
  }, [refresh])

  useEffect(() => {
    if (!selectedFriendId) {
      updateConversationWindow(createEmptyConversationWindow())
      return
    }

    queueMicrotask(() => void loadConversationPage(selectedFriendId, "initial"))
  }, [loadConversationPage, selectedFriendId, updateConversationWindow])

  useEffect(() => {
    if (!conversationVisible || !selectedFriendIdRef.current) {
      return
    }

    const currentFriendId = selectedFriendIdRef.current
    const currentWindow = conversationWindowRef.current

    if (
      currentWindow.friendId === currentFriendId &&
      currentFriendId === selectedFriend?.id &&
      selectedFriend.unread > 0
    ) {
      updateConversationWindow((current) => ({
        ...current,
        hasNewer: true,
        pendingNewerCount: Math.max(current.pendingNewerCount, selectedFriend.unread),
      }))
      return
    }

    if (currentWindow.friendId === currentFriendId && currentWindow.items.length > 0) {
      return
    }

    queueMicrotask(() => void loadConversationPage(currentFriendId, "initial"))
  }, [conversationVisible, loadConversationPage, selectedFriend?.id, selectedFriend?.unread, updateConversationWindow])

  useEffect(() => {
    if (pathname === "/") {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      setConversationVisibleState(false)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    const token = tokenStore.get()

    if (!token || !user) {
      return
    }

    const socket = createRealtimeSocket(token)

    socket.on("connect", () => {
      void refresh().then(() => {
        if (selectedFriendIdRef.current) {
          return loadConversationPage(selectedFriendIdRef.current, "initial")
        }
      })
    })

    socket.on("message:new", (message: RealtimeMessage) => {
      if (message.senderId === user.id) {
        return
      }

      const currentFriendId = selectedFriendIdRef.current

      if (
        currentFriendId &&
        conversationWindowRef.current.friendId === currentFriendId &&
        (message.senderId === currentFriendId || message.receiverId === currentFriendId)
      ) {
        if (conversationVisibleRef.current) {
          const friend = friendsRef.current.find((item) => item.id === currentFriendId)

          if (!friend) {
            void refresh()
            return
          }

          void decryptMessageFromFriend(user, friend, {
            id: message.id,
            sequence: message.sequence,
            senderId: message.senderId,
            receiverId: message.receiverId,
            encryptedContent: message.encryptedContent,
            encryptionIv: message.encryptionIv,
            encryptionVersion: message.encryptionVersion,
            createdAt: message.createdAt,
            isMe: message.senderId === user.id,
          }).then((decryptedMessage) => {
            updateConversationWindow((current) => {
              if (
                current.friendId !== currentFriendId ||
                current.items.some((item) => item.id === decryptedMessage.id)
              ) {
                return current
              }

              return {
                ...current,
                items: [...current.items, { ...decryptedMessage, isNew: true }],
                newestCursor: decryptedMessage.sequence,
                hasNewer: false,
                pendingNewerCount: conversationAtBottomRef.current
                  ? 0
                  : current.pendingNewerCount + 1,
              }
            })

            if (conversationAtBottomRef.current) {
              void acknowledgeCurrentConversation()
            } else {
              void refresh()
            }
          })
          return
        }

        updateConversationWindow((current) =>
          current.friendId === currentFriendId
            ? {
                ...current,
                hasNewer: true,
                pendingNewerCount: current.pendingNewerCount + 1,
              }
            : current
        )
      }

      void refresh()
    })

    socket.on("friend-request:new", (request: FriendRequest) => {
      setFriendRequestAlerts((current) => [
        ...current.filter((item) => item.id !== request.id),
        request,
      ])
      void refresh()
    })

    socket.on("friends:changed", () => {
      void refresh()
    })

    socket.on("presence:snapshot", (snapshot: PresenceSnapshot) => {
      const onlineIds = new Set(snapshot.userIds)

      setFriends((current) =>
        current.map((friend) => ({
          ...friend,
          online: onlineIds.has(friend.id),
        }))
      )
    })

    socket.on("presence:update", (presence: PresenceUpdate) => {
      setFriends((current) =>
        current.map((friend) =>
          friend.id === presence.userId
            ? { ...friend, online: presence.online }
            : friend
        )
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [acknowledgeCurrentConversation, loadConversationPage, refresh, updateConversationWindow, user])

  const addFriendByLink = useCallback(
    async (link: string) => {
      await friendsApi.addByLink(link)
      await refresh()
    },
    [refresh]
  )

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get("friend")

    if (!code) {
      return
    }

    queueMicrotask(() => void addFriendByLink(window.location.href).finally(() => {
      url.searchParams.delete("friend")
      window.history.replaceState(null, "", url.toString())
    }))
  }, [addFriendByLink])

  const setSelectedFriendId = useCallback((id: string | null) => {
    setSelectedFriendIdState(id)
  }, [])

  const setConversationVisible = useCallback((visible: boolean) => {
    setConversationVisibleState(visible)
  }, [])

  const setConversationAtBottom = useCallback((atBottom: boolean) => {
    setConversationAtBottomState(atBottom)
  }, [])

  const searchFriend = useCallback((friendCode: string) => {
    return friendsApi.search(friendCode)
  }, [])

  const sendFriendRequest = useCallback(
    async (friendCode: string) => {
      await friendsApi.request(friendCode)
      await refresh()
    },
    [refresh]
  )

  const respondRequest = useCallback(
    async (requestId: string, accept: boolean) => {
      await friendsApi.respond(requestId, accept)
      await refresh()
    },
    [refresh]
  )

  const sendMessage = useCallback(
    (content: string) => {
      if (!selectedFriendId || !selectedFriend || !user) {
        return
      }

      const optimisticMessage = createOptimisticMessage(
        user.id,
        selectedFriendId,
        content,
        "sending"
      )

      updateConversationWindow((current) => {
        if (current.friendId !== selectedFriendId) {
          return current
        }

        return {
          ...current,
          items: [...current.items, optimisticMessage],
          newestCursor: optimisticMessage.sequence,
          hasNewer: false,
          pendingNewerCount: 0,
        }
      })

      void (async () => {
        try {
          const encrypted = await encryptMessageForFriend(user, selectedFriend, content)
          const sentMessage = await messagesApi.send(selectedFriendId, encrypted)

          updateConversationWindow((current) => {
            if (current.friendId !== selectedFriendId) {
              return current
            }

            return {
              ...current,
              items: current.items.map((message) =>
                message.id === optimisticMessage.id
                  ? {
                      ...message,
                      id: sentMessage.id,
                      sequence: sentMessage.sequence,
                      encryptedContent: sentMessage.encryptedContent,
                      encryptionIv: sentMessage.encryptionIv,
                      encryptionVersion: sentMessage.encryptionVersion,
                      createdAt: sentMessage.createdAt,
                      deliveryStatus: "sent",
                    }
                  : message
              ),
              newestCursor: sentMessage.sequence,
            }
          })
          await refresh()
        } catch {
          updateConversationWindow((current) => {
            if (current.friendId !== selectedFriendId) {
              return current
            }

            return {
              ...current,
              items: current.items.map((message) =>
                message.id === optimisticMessage.id
                  ? {
                      ...message,
                      deliveryStatus: "failed",
                    }
                  : message
              ),
            }
          })
        }
      })()
    },
    [refresh, selectedFriend, selectedFriendId, updateConversationWindow, user]
  )

  const resendMessage = useCallback(
    (messageId: string) => {
      const current = conversationWindowRef.current
      const targetMessage = current.items.find((message) => message.id === messageId)

      if (!targetMessage || targetMessage.deliveryStatus !== "failed") {
        return
      }

      updateConversationWindow((windowState) => ({
        ...windowState,
        items: windowState.items.map((message) =>
          message.id === messageId
            ? {
                ...message,
                deliveryStatus: "sending",
                isNew: true,
              }
            : message
        ),
      }))

      sendMessage(targetMessage.content)

      updateConversationWindow((windowState) => ({
        ...windowState,
        items: windowState.items.filter((message) => message.id !== messageId),
      }))
    },
    [sendMessage, updateConversationWindow]
  )

  const loadOlderMessages = useCallback(async () => {
    if (!selectedFriendIdRef.current) {
      return
    }

    await loadConversationPage(selectedFriendIdRef.current, "older")
  }, [loadConversationPage])

  const loadNewerMessages = useCallback(async () => {
    if (!selectedFriendIdRef.current) {
      return
    }

    await loadConversationPage(selectedFriendIdRef.current, "newer", {
      consumePending: true,
    })
  }, [loadConversationPage])

  const value = useMemo(
    () => ({
      friends,
      requests,
      selectedFriendId,
      selectedFriend,
      messages: conversationWindow.items,
      firstMessageItemIndex: conversationWindow.firstItemIndex,
      hasOlderMessages: conversationWindow.hasOlder,
      hasNewerMessages: conversationWindow.hasNewer,
      loadingOlderMessages: conversationWindow.loadingOlder,
      loadingNewerMessages: conversationWindow.loadingNewer,
      pendingNewerCount: conversationWindow.pendingNewerCount,
      loading,
      setSelectedFriendId,
      setConversationVisible,
      setConversationAtBottom,
      acknowledgeCurrentConversation,
      loadOlderMessages,
      loadNewerMessages,
      refresh,
      searchFriend,
      sendFriendRequest,
      addFriendByLink,
      respondRequest,
      sendMessage,
      resendMessage,
    }),
    [
      addFriendByLink,
      friends,
      loading,
      conversationWindow,
      loadNewerMessages,
      loadOlderMessages,
      refresh,
      requests,
      acknowledgeCurrentConversation,
      respondRequest,
      searchFriend,
      selectedFriend,
      selectedFriendId,
      sendFriendRequest,
      sendMessage,
      resendMessage,
      setConversationAtBottom,
      setConversationVisible,
      setSelectedFriendId,
    ]
  )

  return (
    <ChatContext.Provider value={value}>
      {children}
      {friendRequestAlerts.length ? (
        <div className="fixed right-4 top-16 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          {friendRequestAlerts.map((request) => (
            <FriendRequestRealtimeAlert
              key={request.id}
              request={request}
              onClose={() => {
                setFriendRequestAlerts((current) =>
                  current.filter((item) => item.id !== request.id)
                )
              }}
              onOpenRequests={() => {
                setFriendRequestAlerts((current) =>
                  current.filter((item) => item.id !== request.id)
                )
                router.push("/notification")
              }}
            />
          ))}
        </div>
      ) : null}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error("useChat must be used inside ChatProvider")
  }

  return context
}
