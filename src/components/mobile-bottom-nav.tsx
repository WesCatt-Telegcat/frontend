"use client"

import {Bell, Inbox, Settings} from "lucide-react"
import {usePathname, useRouter} from "next/navigation"
import {useChat} from "@/components/index/chat-provider"
import {cn} from "@/lib/utils"
import {useAppTranslations} from "@/i18n/use-app-translations"

export function MobileBottomNav() {
    const path = usePathname()
    const router = useRouter()
    const {friends, pendingNewerCount, requests, selectedFriendId} = useChat()
    const t = useAppTranslations()
    const safePendingNewerCount = Number.isFinite(pendingNewerCount) ? Math.max(0, pendingNewerCount) : 0
    const hasUnreadMessages = friends.some((friend) => {
        const safeUnread = Number.isFinite(friend.unread) ? Math.max(0, friend.unread) : 0
        const displayUnread = friend.id === selectedFriendId
            ? Math.max(safeUnread, safePendingNewerCount)
            : safeUnread

        return displayUnread > 0
    })

    const items = [
        {
            title: t("chat"),
            url: "/",
            icon: Inbox,
            hasIndicator: hasUnreadMessages,
        },
        {
            title: t("notification"),
            url: "/notification",
            icon: Bell,
            hasIndicator: requests.length > 0,
        },
        {
            title: t("settings"),
            url: "/settings",
            icon: Settings,
            hasIndicator: false,
        },
    ]

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden">
            <div className="grid grid-cols-3">
                {items.map((item) => {
                    const isActive = path === item.url

                    return (
                        <button
                            key={item.url}
                            type="button"
                            className={cn(
                                "flex min-h-16 flex-col items-center justify-center gap-1 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] pt-2 text-xs transition",
                                isActive ? "text-foreground" : "text-muted-foreground"
                            )}
                            onClick={() => router.push(item.url)}
                        >
                            <span className="relative flex shrink-0">
                                <item.icon className={cn("size-5", isActive && "text-unread")}/>
                                {item.hasIndicator ? (
                                    <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-unread ring-2 ring-background"/>
                                ) : null}
                            </span>
                            <span className={cn("leading-none", isActive && "font-medium")}>
                                {item.title}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
