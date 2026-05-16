"use client"

import {SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader} from "@/components/ui/sidebar";
import {Label} from "@/components/ui/label";
import {IndexDropDown} from "@/components/index/IndexDropDown";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Point} from "@/components/index/Point";
import {useChat} from "@/components/index/chat-provider";
import dayjs from "dayjs";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function NotificationSideBar() {
    const {requests} = useChat();
    const t = useAppTranslations();

    return (
        <>
            <SidebarHeader className="gap-3.5 border-b p-4">
                <div className="flex w-full items-center justify-between">
                    <div className="text-base font-medium text-foreground">
                        {t("notification")}
                    </div>
                    <Label className="flex items-center gap-2 text-sm">
                        <IndexDropDown/>
                    </Label>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="px-0">
                    <SidebarGroupContent>
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="flex flex-col items-start gap-2 border-b px-2 py-2 text-sm leading-tight whitespace-nowrap last:border-b-0"
                            >
                                <div className='flex w-full items-center justify-between gap-2'>
                                    <div className='flex min-w-0 items-center gap-2'>
                                        <Avatar>
                                            <AvatarImage
                                                src={request.requester.avatar ?? "/user-default-avatar.jpg"}
                                                alt="avatar"/>
                                            <AvatarFallback>{request.requester.name.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{request.requester.name}</span>
                                    </div>
                                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                        {dayjs(request.createdAt).format("HH:mm")}
                                    </span>
                                </div>
                                <div className="flex w-full items-center gap-2">
                                    <span className="line-clamp-2 min-w-0 flex-1 text-xs text-muted-foreground">
                                        {t("requestLine")}
                                    </span>
                                    <Point number={1}/>
                                </div>
                            </div>
                        ))}
                        {!requests.length ? (
                            <div className="p-4 text-sm text-muted-foreground">{t("noRequests")}</div>
                        ) : null}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </>
    )
}
