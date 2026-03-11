import {Badge} from "@/components/ui/badge";
import React from "react";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import dayjs from "dayjs";

export function MessageBox({isMe = true, message, time = Date.now()}) {

    return (
        <div className={`flex ${isMe ? " flex-row-reverse" : ""} gap-2 w-full`}>
            <Avatar>
                <AvatarImage
                    src="/user-default-avatar.jpg"
                    alt="avatar"/>
            </Avatar>
            <div
                className={`py-2 px-4 rounded-[20px] min-w-[100px]  h-auto flex flex-col items-start ${isMe ? "bg-slate-900 text-white" : "bg-neutral-100"}`}>
                <p>{message}</p>
                <div className={'w-full text-end text-[11px]'}>{dayjs(time).format('H:m')}</div>
            </div>
        </div>
    )
}