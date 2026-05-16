"use client"

import {SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInput} from "@/components/ui/sidebar";
import {Label} from "@/components/ui/label";
import {IndexDropDown} from "@/components/index/IndexDropDown";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Point} from "@/components/index/Point";
import {useMemo, useState} from "react";
import {useChat} from "@/components/index/chat-provider";
import {cn} from "@/lib/utils";
import dayjs from "dayjs";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function SidebarInner({onSelectFriend}: { onSelectFriend?: () => void }) {
    const {friends, selectedFriendId, setSelectedFriendId, loading} = useChat();
    const t = useAppTranslations();
    const [query, setQuery] = useState("");
    const filteredFriends = useMemo(() => {
        const keyword = query.trim().toLowerCase();

        if (!keyword) {
            return friends;
        }

        return friends.filter((friend) =>
            [friend.name, friend.email, friend.friendCode].some((value) =>
                value.toLowerCase().includes(keyword)
            )
        );
    }, [friends, query]);

    return (
        <>
            <SidebarHeader className="gap-3.5 border-b p-4">
                <div className="flex w-full items-center justify-between">
                    <div className="text-base font-medium text-foreground">
                        {t("chat")}
                    </div>
                    <Label className="flex items-center gap-2 text-sm">
                        <IndexDropDown/>
                    </Label>
                </div>
                <SidebarInput
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("searchPlaceholder")}
                />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="px-0">
                    <SidebarGroupContent>
                        {filteredFriends.map((friend) => (
                            <button
                                type="button"
                                key={friend.id}
                                onClick={() => {
                                    setSelectedFriendId(friend.id);
                                    onSelectFriend?.();
                                }}
                                className={cn(
                                    "flex w-full flex-col items-start gap-2 border-b px-2 py-2 text-left text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    selectedFriendId === friend.id && "bg-muted"
                                )}
                            >
                                <div className='flex w-full items-center justify-between gap-2'>
                                    <div className='flex min-w-0 items-center gap-2'>
                                        <div className="relative shrink-0">
                                            <Avatar>
                                                <AvatarImage
                                                    src={friend.avatar ?? "/user-default-avatar.jpg"}
                                                    alt="avatar"/>
                                                <AvatarFallback>{friend.name.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <span
                                                className={cn(
                                                    "absolute bottom-0 right-0 size-2.5 rounded-full border border-sidebar",
                                                    friend.online ? "bg-green-500" : "bg-muted-foreground"
                                                )}
                                            />
                                        </div>
                                        <span className="truncate">{friend.name}</span>
                                    </div>
                                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                        {dayjs(friend.lastMessageAt).format("HH:mm")}
                                    </span>
                                </div>
                                <div className="flex w-full items-center gap-2">
                                    <span className="line-clamp-2 min-w-0 flex-1 text-xs whitespace-break-spaces text-muted-foreground">
                                        {friend.lastMessage}
                                    </span>
                                    <Point number={friend.unread}/>
                                </div>
                            </button>
                        ))}
                        {!filteredFriends.length ? (
                            <div className="p-4 text-sm text-muted-foreground">
                                {loading ? t("loading") : t("noFriends")}
                            </div>
                        ) : null}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </>
    )
}
