import type {
    EncryptedMessage,
    FriendConversation,
    Message,
    SendEncryptedMessageInput,
    User,
} from "@/lib/types";

const KEY_PREFIX = "telecat_e2ee";
const UNAVAILABLE_MESSAGE = "[无法解密消息]";

type StoredKeys = {
    publicKey: string
    privateKey: JsonWebKey
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

function readStoredKeys(userId: string): StoredKeys | null {
    const raw = window.localStorage.getItem(keyStorageName(userId));

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as StoredKeys;
    } catch {
        window.localStorage.removeItem(keyStorageName(userId));
        return null;
    }
}

async function generateStoredKeys(userId: string) {
    const pair = await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        ["deriveKey"]
    );
    const publicKey = JSON.stringify(
        await window.crypto.subtle.exportKey("jwk", pair.publicKey)
    );
    const privateKey = await window.crypto.subtle.exportKey("jwk", pair.privateKey);
    const storedKeys = {publicKey, privateKey};

    window.localStorage.setItem(keyStorageName(userId), JSON.stringify(storedKeys));

    return storedKeys;
}

async function getStoredKeys(userId: string) {
    return readStoredKeys(userId) ?? generateStoredKeys(userId);
}

async function importPrivateKey(privateKey: JsonWebKey) {
    return window.crypto.subtle.importKey(
        "jwk",
        privateKey,
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        false,
        ["deriveKey"]
    );
}

async function importPublicKey(publicKey: string) {
    return window.crypto.subtle.importKey(
        "jwk",
        JSON.parse(publicKey) as JsonWebKey,
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        false,
        []
    );
}

async function deriveConversationKey(userId: string, friendPublicKey: string) {
    const storedKeys = await getStoredKeys(userId);
    const privateKey = await importPrivateKey(storedKeys.privateKey);
    const publicKey = await importPublicKey(friendPublicKey);

    return window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey,
        },
        privateKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function ensureUserEncryptionKey(user: User) {
    if (!window.crypto?.subtle) {
        throw new Error("当前浏览器不支持端到端加密");
    }

    await getStoredKeys(user.email);

    return user;
}

export async function getOrCreateEncryptionPublicKey(identity: string) {
    if (!window.crypto?.subtle) {
        throw new Error("当前浏览器不支持端到端加密");
    }

    const storedKeys = await getStoredKeys(identity.trim().toLowerCase());

    return storedKeys.publicKey;
}

export async function encryptMessageForFriend(
    user: User,
    friend: FriendConversation,
    content: string
): Promise<SendEncryptedMessageInput> {
    if (!friend.encryptionPublicKey) {
        throw new Error("对方还没有初始化加密密钥");
    }

    const key = await deriveConversationKey(user.email, friend.encryptionPublicKey);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        new TextEncoder().encode(content)
    );

    return {
        encryptedContent: bytesToBase64(new Uint8Array(encrypted)),
        encryptionIv: bytesToBase64(iv),
    };
}

export async function decryptMessageFromFriend(
    user: User,
    friend: FriendConversation,
    message: EncryptedMessage
): Promise<Message> {
    if (!friend.encryptionPublicKey) {
        return {
            ...message,
            content: UNAVAILABLE_MESSAGE,
        };
    }

    try {
        const key = await deriveConversationKey(user.email, friend.encryptionPublicKey);
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: base64ToBytes(message.encryptionIv),
            },
            key,
            base64ToBytes(message.encryptedContent)
        );

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
