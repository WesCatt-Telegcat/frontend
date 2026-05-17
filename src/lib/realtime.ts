import {io} from "socket.io-client";
import {API_BASE_URL} from "@/lib/env";

export function createRealtimeSocket(token: string) {
    return io(API_BASE_URL, {
        auth: {token},
        reconnection: true,
        reconnectionAttempts: Infinity,
    });
}
