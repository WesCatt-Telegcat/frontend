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
import { useRouter } from "next/navigation"
import { useSession } from "@/components/auth/session-provider"
import { FriendRequestRealtimeAlert } from "@/components/notification/FriendRequestRealtimeAlert"
import { friendsApi, messagesApi, tokenStore } from "@/lib/api"
import {
  decryptMessageFromFriend,
  encryptMessageForFriend,
} from "@/lib/e2ee"
import { createRealtimeSocket } from "@/lib/realtime"
import type {
  FriendConversation,
  FriendRequest,
  FriendSearchResult,
  Message,
} from "@/lib/types"

type ChatContextValue = {
  friends: FriendConversation[]
  requests: FriendRequest[]
  selectedFriendId: string | null
  selectedFriend: FriendConversation | null
  messages: Message[]
  loading: boolean
  setSelectedFriendId: (id: string) => void
  refresh: () => Promise<void>
  searchFriend: (friendCode: string) => Promise<FriendSearchResult>
  sendFriendRequest: (friendCode: string) => Promise<void>
  addFriendByLink: (link: string) => Promise<void>
  respondRequest: (requestId: string, accept: boolean) => Promise<void>
  sendMessage: (content: string) => Promise<void>
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
  senderId: string
  receiverId: string
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useSession()
  const [friends, setFriends] = useState<FriendConversation[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [selectedFriendId, setSelectedFriendIdState] = useState<string | null>(
    null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [friendRequestAlert, setFriendRequestAlert] =
    useState<FriendRequest | null>(null)
  const friendsRef = useRef<FriendConversation[]>([])
  const selectedFriendIdRef = useRef<string | null>(null)

  useEffect(() => {
    friendsRef.current = friends
  }, [friends])

  useEffect(() => {
    selectedFriendIdRef.current = selectedFriendId
  }, [selectedFriendId])

  const loadMessages = useCallback(
    async (friendId: string | null) => {
      if (!friendId || !user) {
        setMessages([])
        return
      }

      const friend = friendsRef.current.find((item) => item.id === friendId)

      if (!friend) {
        setMessages([])
        return
      }

      const encryptedMessages = await messagesApi.list(friendId)
      const nextMessages = await Promise.all(
        encryptedMessages.map((message) =>
          decryptMessageFromFriend(user, friend, message)
        )
      )

      setMessages(nextMessages)
    },
    [user]
  )

  const refresh = useCallback(async () => {
    const [nextFriends, nextRequests] = await Promise.all([
      friendsApi.list(),
      friendsApi.incomingRequests(),
    ])

    setFriends(nextFriends)
    friendsRef.current = nextFriends
    setRequests(nextRequests)
    setSelectedFriendIdState((current) => {
      if (current && nextFriends.some((friend) => friend.id === current)) {
        return current
      }

      return null
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    queueMicrotask(() => void refresh())
  }, [refresh])

  useEffect(() => {
    queueMicrotask(() => void loadMessages(selectedFriendId))
  }, [loadMessages, selectedFriendId])

  useEffect(() => {
    const token = tokenStore.get()

    if (!token || !user) {
      return
    }

    const socket = createRealtimeSocket(token)

    socket.on("connect", () => {
      void refresh().then(() => loadMessages(selectedFriendIdRef.current))
    })

    socket.on("message:new", (message: RealtimeMessage) => {
      const currentFriendId = selectedFriendIdRef.current

      void refresh()

      if (
        currentFriendId &&
        (message.senderId === currentFriendId || message.receiverId === currentFriendId)
      ) {
        void loadMessages(currentFriendId)
      }
    })

    socket.on("friend-request:new", (request: FriendRequest) => {
      setFriendRequestAlert(request)
      void refresh()
    })

    socket.on("friends:changed", () => {
      void refresh().then(() => loadMessages(selectedFriendIdRef.current))
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
  }, [loadMessages, refresh, user])

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

  const setSelectedFriendId = useCallback((id: string) => {
    setSelectedFriendIdState(id)
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

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedFriendId) ?? null,
    [friends, selectedFriendId]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!selectedFriendId || !selectedFriend || !user) {
        return
      }

      const encrypted = await encryptMessageForFriend(user, selectedFriend, content)

      await messagesApi.send(selectedFriendId, encrypted)
      await loadMessages(selectedFriendId)
      await refresh()
    },
    [loadMessages, refresh, selectedFriend, selectedFriendId, user]
  )

  const value = useMemo(
    () => ({
      friends,
      requests,
      selectedFriendId,
      selectedFriend,
      messages,
      loading,
      setSelectedFriendId,
      refresh,
      searchFriend,
      sendFriendRequest,
      addFriendByLink,
      respondRequest,
      sendMessage,
    }),
    [
      addFriendByLink,
      friends,
      loading,
      messages,
      refresh,
      requests,
      respondRequest,
      searchFriend,
      selectedFriend,
      selectedFriendId,
      sendFriendRequest,
      sendMessage,
      setSelectedFriendId,
    ]
  )

  return (
    <ChatContext.Provider value={value}>
      {children}
      {friendRequestAlert ? (
        <FriendRequestRealtimeAlert
          request={friendRequestAlert}
          onClose={() => setFriendRequestAlert(null)}
          onOpenRequests={() => {
            setFriendRequestAlert(null)
            router.push("/notification")
          }}
        />
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
