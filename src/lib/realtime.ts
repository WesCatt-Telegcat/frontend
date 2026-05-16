import {io} from "socket.io-client";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:2617";

export function createRealtimeSocket(token: string) {
    return io(API_BASE_URL, {
        auth: {token},
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
    });
}
