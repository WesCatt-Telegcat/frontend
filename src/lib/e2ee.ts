import nacl from "tweetnacl"
import type {
  EncryptedMessage,
  EncryptionKeyPayload,
  FriendConversation,
  Message,
  SendEncryptedMessageInput,
  User,
} from "@/lib/types"

const KEY_PREFIX = "telecat_e2ee"
const ENCRYPTION_KEY_VERSION = "v1"
const PBKDF2_ITERATIONS = 310000
const SALT_LENGTH = 16
const IV_LENGTH = 12
const UNAVAILABLE_MESSAGE = "[无法解密消息]"
const FRIEND_KEY_REFRESH_MESSAGE = "对方需要重新登录以更新加密密钥"
const DEVICE_SYNC_REQUIRED_MESSAGE =
  "该账号的历史加密密钥还未同步，请先在原来能读取消息的设备上重新登录一次"

type StoredKeys = {
  publicKey: string
  secretKey: string
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function normalizeIdentity(identity: string) {
  return identity.trim().toLowerCase()
}

function keyStorageName(identity: string) {
  return `${KEY_PREFIX}_${normalizeIdentity(identity)}`
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ""

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return window.btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = window.atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)

  return copy.buffer
}

function isValidBase64Key(value: unknown, length: number) {
  if (typeof value !== "string" || !value.trim()) {
    return false
  }

  try {
    return base64ToBytes(value).length === length
  } catch {
    return false
  }
}

function isValidStoredKeys(value: unknown): value is StoredKeys {
  const parsed = value as Partial<StoredKeys> | null

  return Boolean(
    parsed &&
      isValidBase64Key(parsed.publicKey, nacl.box.publicKeyLength) &&
      isValidBase64Key(parsed.secretKey, nacl.box.secretKeyLength)
  )
}

function readStoredKeys(identity: string): StoredKeys | null {
  const raw = window.localStorage.getItem(keyStorageName(identity))

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredKeys>

    if (isValidStoredKeys(parsed)) {
      return {
        publicKey: parsed.publicKey,
        secretKey: parsed.secretKey,
      }
    }
  } catch {
    // noop
  }

  window.localStorage.removeItem(keyStorageName(identity))

  return null
}

function writeStoredKeys(identity: string, storedKeys: StoredKeys) {
  window.localStorage.setItem(
    keyStorageName(identity),
    JSON.stringify(storedKeys)
  )
}

function generateStoredKeys(identity: string) {
  const pair = nacl.box.keyPair()
  const storedKeys = {
    publicKey: bytesToBase64(pair.publicKey),
    secretKey: bytesToBase64(pair.secretKey),
  }

  writeStoredKeys(identity, storedKeys)

  return storedKeys
}

function getExistingOrCreateStoredKeys(identity: string) {
  return readStoredKeys(identity) ?? generateStoredKeys(identity)
}

function requireStoredKeys(identity: string) {
  const storedKeys = readStoredKeys(identity)

  if (!storedKeys) {
    throw new Error(DEVICE_SYNC_REQUIRED_MESSAGE)
  }

  return storedKeys
}

function getCrypto() {
  if (
    typeof window === "undefined" ||
    !window.crypto ||
    typeof window.crypto.getRandomValues !== "function" ||
    !window.crypto.subtle
  ) {
    throw new Error("当前环境不支持端到端加密")
  }

  return window.crypto
}

async function deriveBundleKey(
  password: string,
  salt: Uint8Array,
  usages: KeyUsage[]
) {
  const crypto = getCrypto()
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    usages
  )
}

async function createEncryptionPayloadFromStoredKeys(
  storedKeys: StoredKeys,
  password: string
): Promise<EncryptionKeyPayload> {
  const crypto = getCrypto()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveBundleKey(password, salt, ["encrypt"])
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(textEncoder.encode(JSON.stringify(storedKeys)))
  )

  return {
    encryptionPublicKey: storedKeys.publicKey,
    encryptedPrivateKey: bytesToBase64(new Uint8Array(encrypted)),
    encryptionKeySalt: bytesToBase64(salt),
    encryptionKeyIv: bytesToBase64(iv),
    encryptionKeyVersion: ENCRYPTION_KEY_VERSION,
  }
}

function hasEncryptedKeyBundle(
  user: Pick<
    User,
    | "encryptionPublicKey"
    | "encryptedPrivateKey"
    | "encryptionKeySalt"
    | "encryptionKeyIv"
  >
) {
  return Boolean(
    user.encryptionPublicKey &&
      user.encryptedPrivateKey &&
      user.encryptionKeySalt &&
      user.encryptionKeyIv
  )
}

async function restoreStoredKeysFromBundle(user: User, password: string) {
  if (!hasEncryptedKeyBundle(user)) {
    return null
  }

  const key = await deriveBundleKey(
    password,
    base64ToBytes(user.encryptionKeySalt as string),
    ["decrypt"]
  )

  try {
    const decrypted = await getCrypto().subtle.decrypt(
      {
        name: "AES-GCM",
        iv: toArrayBuffer(base64ToBytes(user.encryptionKeyIv as string)),
      },
      key,
      toArrayBuffer(base64ToBytes(user.encryptedPrivateKey as string))
    )
    const parsed = JSON.parse(
      textDecoder.decode(new Uint8Array(decrypted))
    ) as Partial<StoredKeys>

    if (!isValidStoredKeys(parsed)) {
      throw new Error("Invalid encrypted key payload")
    }

    if (
      user.encryptionPublicKey &&
      parsed.publicKey !== user.encryptionPublicKey
    ) {
      throw new Error("Mismatched encryption public key")
    }

    return {
      publicKey: parsed.publicKey,
      secretKey: parsed.secretKey,
    } satisfies StoredKeys
  } catch {
    throw new Error("无法恢复该账号的加密密钥，请确认密码正确")
  }
}

export async function createEncryptionPayloadForRegister(
  identity: string,
  password: string
) {
  const storedKeys = getExistingOrCreateStoredKeys(identity)

  return createEncryptionPayloadFromStoredKeys(storedKeys, password)
}

export async function bootstrapEncryptionAfterLogin(
  user: User,
  password: string
) {
  const identity = normalizeIdentity(user.email)
  const localKeys = readStoredKeys(identity)

  if (hasEncryptedKeyBundle(user)) {
    const restoredKeys = await restoreStoredKeysFromBundle(user, password)

    if (!restoredKeys) {
      throw new Error("无法恢复该账号的加密密钥")
    }

    if (
      !localKeys ||
      localKeys.publicKey !== restoredKeys.publicKey ||
      localKeys.secretKey !== restoredKeys.secretKey
    ) {
      writeStoredKeys(identity, restoredKeys)
    }

    return null
  }

  if (localKeys) {
    if (
      user.encryptionPublicKey &&
      user.encryptionPublicKey !== localKeys.publicKey
    ) {
      throw new Error(DEVICE_SYNC_REQUIRED_MESSAGE)
    }

    return createEncryptionPayloadFromStoredKeys(localKeys, password)
  }

  if (user.encryptionPublicKey) {
    throw new Error(DEVICE_SYNC_REQUIRED_MESSAGE)
  }

  const generatedKeys = generateStoredKeys(identity)

  return createEncryptionPayloadFromStoredKeys(generatedKeys, password)
}

export function getStoredEncryptionPublicKey(identity: string) {
  return readStoredKeys(identity)?.publicKey ?? null
}

export function isValidEncryptionPublicKey(value: string | null | undefined) {
  return isValidBase64Key(value, nacl.box.publicKeyLength)
}

export async function encryptMessageForFriend(
  user: User,
  friend: FriendConversation,
  content: string
): Promise<SendEncryptedMessageInput> {
  if (!friend.encryptionPublicKey) {
    throw new Error("对方还没有初始化加密密钥")
  }

  if (!isValidEncryptionPublicKey(friend.encryptionPublicKey)) {
    throw new Error(FRIEND_KEY_REFRESH_MESSAGE)
  }

  const storedKeys = requireStoredKeys(user.email)
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const encrypted = nacl.box(
    textEncoder.encode(content),
    nonce,
    base64ToBytes(friend.encryptionPublicKey),
    base64ToBytes(storedKeys.secretKey)
  )

  return {
    encryptedContent: bytesToBase64(encrypted),
    encryptionIv: bytesToBase64(nonce),
  }
}

export async function decryptMessageFromFriend(
  user: User,
  friend: FriendConversation,
  message: EncryptedMessage
): Promise<Message> {
  if (
    !friend.encryptionPublicKey ||
    !isValidEncryptionPublicKey(friend.encryptionPublicKey)
  ) {
    return {
      ...message,
      content: UNAVAILABLE_MESSAGE,
    }
  }

  try {
    const storedKeys = requireStoredKeys(user.email)
    const decrypted = nacl.box.open(
      base64ToBytes(message.encryptedContent),
      base64ToBytes(message.encryptionIv),
      base64ToBytes(friend.encryptionPublicKey),
      base64ToBytes(storedKeys.secretKey)
    )

    if (!decrypted) {
      throw new Error("Failed to decrypt")
    }

    return {
      ...message,
      content: textDecoder.decode(decrypted),
    }
  } catch {
    return {
      ...message,
      content: UNAVAILABLE_MESSAGE,
    }
  }
}

export async function decryptConversationPreview(
  user: User,
  friend: FriendConversation
) {
  if (!friend.lastMessageEncryptedContent || !friend.lastMessageEncryptionIv) {
    return friend.lastMessage
  }

  const previewMessage: EncryptedMessage = {
    id: `preview-${friend.id}`,
    sequence: `preview-${friend.id}`,
    senderId: friend.lastMessageSenderId ?? friend.id,
    receiverId:
      friend.lastMessageSenderId === user.id ? friend.id : user.id,
    encryptedContent: friend.lastMessageEncryptedContent,
    encryptionIv: friend.lastMessageEncryptionIv,
    encryptionVersion: friend.lastMessageEncryptionVersion ?? "v1",
    createdAt: friend.lastMessageAt,
    readAt: null,
    isMe: friend.lastMessageSenderId === user.id,
  }

  const decryptedMessage = await decryptMessageFromFriend(
    user,
    friend,
    previewMessage
  )

  return decryptedMessage.content
}
