import React from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import dayjs from "dayjs";
import {cn} from "@/lib/utils";

export function MessageBox({isMe = true, message, time}: {
    isMe?: boolean
    message: string
    time: string | number | Date
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
                    "flex h-auto max-w-[72%] min-w-[100px] flex-col items-start rounded-xl px-4 py-2",
                    isMe ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"
                )}
            >
                <p className="whitespace-pre-wrap break-words text-sm">{message}</p>
                <div className="w-full text-end text-[11px] opacity-70">{dayjs(time).format('HH:mm')}</div>
            </div>
        </div>
    )
}
