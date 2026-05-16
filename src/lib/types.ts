export type User = {
  id: string
  email: string
  name: string
  friendCode: string
  friendLink: string
  avatar: string | null
  encryptionPublicKey: string | null
}

export type AuthResponse = {
  token: string
  user: User
}

export type FriendSearchResult = {
  id: string
  name: string
  email: string
  avatar: string | null
  friendCode: string
  encryptionPublicKey: string | null
  relation: "SELF" | "FRIEND" | "REQUESTED" | "NEED_ACCEPT" | "NONE"
}

export type FriendConversation = {
  id: string
  name: string
  email: string
  avatar: string | null
  friendCode: string
  encryptionPublicKey: string | null
  lastMessage: string
  lastMessageAt: string
  unread: number
  online: boolean
}

export type FriendRequest = {
  id: string
  createdAt: string
  requester: {
    id: string
    name: string
    email: string
    avatar: string | null
    friendCode: string
    encryptionPublicKey: string | null
  }
}

export type EncryptedMessage = {
  id: string
  senderId: string
  receiverId: string
  encryptedContent: string
  encryptionIv: string
  encryptionVersion: string
  createdAt: string
  isMe: boolean
}

export type Message = EncryptedMessage & {
  content: string
}

export type SendEncryptedMessageInput = {
  encryptedContent: string
  encryptionIv: string
}
