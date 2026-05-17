import React from "react";
import {AlertCircle, LoaderCircle} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import dayjs from "dayjs";
import {cn} from "@/lib/utils";
import type {MessageDeliveryStatus} from "@/lib/types";

export function MessageBox({
    isMe = true,
    message,
    time,
    deliveryStatus,
    isNew = false,
    onRetry,
}: {
    isMe?: boolean
    message: string
    time: string | number | Date
    deliveryStatus?: MessageDeliveryStatus
    isNew?: boolean
    onRetry?: () => void
}) {
    return (
        <div className={cn("flex w-full gap-2", isMe && "flex-row-reverse")}>
            <Avatar>
                <AvatarImage
                    src="/user-default-avatar.jpg"
                    alt="avatar"/>
                <AvatarFallback>{isMe ? "我" : "友"}</AvatarFallback>
            </Avatar>
            <div
                className={cn(
                    "flex min-w-0 flex-1 items-end gap-2",
                    isMe ? "justify-end" : "justify-start"
                )}
            >
                <div
                    className={cn(
                        "flex h-auto min-w-0 flex-col items-start overflow-hidden rounded-xl px-4 py-2",
                        isMe ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted",
                        ((isMe && deliveryStatus === "sending") || (!isMe && isNew)) && "message-enter"
                    )}
                    style={{width: "fit-content", maxWidth: "65%"}}
                >
                    <p
                        className="w-full whitespace-pre-wrap text-sm"
                        style={{wordBreak: "break-all", overflowWrap: "anywhere"}}
                    >
                        {message}
                    </p>
                    <div className="w-full text-end text-[11px] opacity-70">{dayjs(time).format('HH:mm')}</div>
                </div>
                {isMe && deliveryStatus === "sending" ? (
                    <LoaderCircle className="size-4 animate-spin text-muted-foreground"/>
                ) : null}
                {isMe && deliveryStatus === "failed" ? (
                    <button
                        type="button"
                        className="rounded-full p-0.5 text-destructive transition hover:bg-destructive/10"
                        onClick={onRetry}
                    >
                        <AlertCircle className="size-4"/>
                        <span className="sr-only">Retry</span>
                    </button>
                ) : null}
            </div>
        </div>
    )
}
