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
  lastMessageEncryptedContent: string | null
  lastMessageEncryptionIv: string | null
  lastMessageEncryptionVersion: string | null
  lastMessageSenderId: string | null
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
  sequence: string
  senderId: string
  receiverId: string
  encryptedContent: string
  encryptionIv: string
  encryptionVersion: string
  createdAt: string
  isMe: boolean
}

export type MessageDeliveryStatus = "sending" | "failed" | "sent"

export type Message = EncryptedMessage & {
  content: string
  deliveryStatus?: MessageDeliveryStatus
  isNew?: boolean
}

export type MessagePage = {
  items: EncryptedMessage[]
  page: {
    hasOlder: boolean
    hasNewer: boolean
    oldestCursor: string | null
    newestCursor: string | null
  }
}

export type SendEncryptedMessageInput = {
  encryptedContent: string
  encryptionIv: string
}

export type PaymentProvider = "ALIPAY" | "WECHAT"

export type PaymentOrderStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CLOSED"
  | "EXPIRED"

export type PaymentMethodStatus = {
  available: boolean
  reason: string | null
}

export type PaymentMethods = {
  alipay: PaymentMethodStatus
  wechat: PaymentMethodStatus
}

export type DonationOrder = {
  id: string
  provider: PaymentProvider
  status: PaymentOrderStatus
  amountFen: number
  outTradeNo: string
  qrContent: string | null
  qrContentType: string | null
  expiresAt: string | null
  paidAt: string | null
  createdAt: string
}
