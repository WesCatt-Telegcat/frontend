import nacl from "tweetnacl";
import type {
    EncryptedMessage,
    FriendConversation,
    Message,
    SendEncryptedMessageInput,
    User,
} from "@/lib/types";

const KEY_PREFIX = "telecat_e2ee";
const UNAVAILABLE_MESSAGE = "[无法解密消息]";
const FRIEND_KEY_REFRESH_MESSAGE = "对方需要重新登录以更新加密密钥";

type StoredKeys = {
    publicKey: string
    secretKey: string
}

function keyStorageName(userId: string) {
    return `${KEY_PREFIX}_${userId}`;
}

function bytesToBase64(bytes: Uint8Array) {
    let binary = "";

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return window.btoa(binary);
}

function base64ToBytes(value: string) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

function isValidBase64Key(value: unknown, length: number) {
    if (typeof value !== "string" || !value.trim()) {
        return false;
    }

    try {
        return base64ToBytes(value).length === length;
    } catch {
        return false;
    }
}

function readStoredKeys(userId: string): StoredKeys | null {
    const raw = window.localStorage.getItem(keyStorageName(userId));

    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<StoredKeys>;

        if (
            isValidBase64Key(parsed.publicKey, nacl.box.publicKeyLength) &&
            isValidBase64Key(parsed.secretKey, nacl.box.secretKeyLength)
        ) {
            return {
                publicKey: parsed.publicKey as string,
                secretKey: parsed.secretKey as string,
            };
        }

        window.localStorage.removeItem(keyStorageName(userId));
        return null;
    } catch {
        window.localStorage.removeItem(keyStorageName(userId));
        return null;
    }
}

function generateStoredKeys(userId: string) {
    const pair = nacl.box.keyPair();
    const storedKeys = {
        publicKey: bytesToBase64(pair.publicKey),
        secretKey: bytesToBase64(pair.secretKey),
    };

    window.localStorage.setItem(keyStorageName(userId), JSON.stringify(storedKeys));

    return storedKeys;
}

async function getStoredKeys(userId: string) {
    return readStoredKeys(userId) ?? generateStoredKeys(userId);
}

export async function ensureUserEncryptionKey(user: User) {
    await getStoredKeys(user.email);

    return user;
}

export async function getOrCreateEncryptionPublicKey(identity: string) {
    const storedKeys = await getStoredKeys(identity.trim().toLowerCase());

    return storedKeys.publicKey;
}

export function isValidEncryptionPublicKey(value: string | null | undefined) {
    return isValidBase64Key(value, nacl.box.publicKeyLength);
}

export async function encryptMessageForFriend(
    user: User,
    friend: FriendConversation,
    content: string
): Promise<SendEncryptedMessageInput> {
    if (!friend.encryptionPublicKey) {
        throw new Error("对方还没有初始化加密密钥");
    }

    if (!isValidEncryptionPublicKey(friend.encryptionPublicKey)) {
        throw new Error(FRIEND_KEY_REFRESH_MESSAGE);
    }

    const storedKeys = await getStoredKeys(user.email);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encrypted = nacl.box(
        new TextEncoder().encode(content),
        nonce,
        base64ToBytes(friend.encryptionPublicKey),
        base64ToBytes(storedKeys.secretKey)
    );

    return {
        encryptedContent: bytesToBase64(encrypted),
        encryptionIv: bytesToBase64(nonce),
    };
}

export async function decryptMessageFromFriend(
    user: User,
    friend: FriendConversation,
    message: EncryptedMessage
): Promise<Message> {
    if (!friend.encryptionPublicKey || !isValidEncryptionPublicKey(friend.encryptionPublicKey)) {
        return {
            ...message,
            content: UNAVAILABLE_MESSAGE,
        };
    }

    try {
        const storedKeys = await getStoredKeys(user.email);
        const decrypted = nacl.box.open(
            base64ToBytes(message.encryptedContent),
            base64ToBytes(message.encryptionIv),
            base64ToBytes(friend.encryptionPublicKey),
            base64ToBytes(storedKeys.secretKey)
        );

        if (!decrypted) {
            throw new Error("Failed to decrypt");
        }

        return {
            ...message,
            content: new TextDecoder().decode(decrypted),
        };
    } catch {
        return {
            ...message,
            content: UNAVAILABLE_MESSAGE,
        };
    }
}

export async function decryptConversationPreview(
    user: User,
    friend: FriendConversation
) {
    if (!friend.lastMessageEncryptedContent || !friend.lastMessageEncryptionIv) {
        return friend.lastMessage;
    }

    const previewMessage: EncryptedMessage = {
        id: `preview-${friend.id}`,
        senderId: friend.lastMessageSenderId ?? friend.id,
        receiverId:
            friend.lastMessageSenderId === user.id ? friend.id : user.id,
        encryptedContent: friend.lastMessageEncryptedContent,
        encryptionIv: friend.lastMessageEncryptionIv,
        encryptionVersion: friend.lastMessageEncryptionVersion ?? "v1",
        createdAt: friend.lastMessageAt,
        isMe: friend.lastMessageSenderId === user.id,
    };

    const decryptedMessage = await decryptMessageFromFriend(
        user,
        friend,
        previewMessage
    );

    return decryptedMessage.content;
}
