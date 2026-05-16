"use client"

import * as React from "react"
import {Bell, Inbox, Settings, Sparkles} from "lucide-react"

import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image";
import {SidebarInner} from "@/components/index/SidebarInner";
import {useChat} from "@/components/index/chat-provider";
import {usePathname, useRouter} from "next/navigation";
import {NotificationSideBar} from "@/components/notification/NotificationSideBar";
import {useSession} from "@/components/auth/session-provider";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const path = usePathname();
    const router = useRouter();
    const {user} = useSession();
    const {friends, pendingNewerCount, requests, selectedFriendId} = useChat();
    const t = useAppTranslations();
    const hasUnreadMessages = friends.some(
        (friend) =>
            friend.unread +
                (friend.id === selectedFriendId ? pendingNewerCount : 0) >
            0
    );
    const hasPendingRequests = requests.length > 0;
    const navMain = [
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
            hasIndicator: hasPendingRequests,
        },
        {
            title: t("sponsor"),
            url: "/sponsor",
            icon: Sparkles,
            hasIndicator: false,
        },
        {
            title: t("settings"),
            url: "/settings",
            icon: Settings,
            hasIndicator: false,
        }
    ];
    const sideInner = path === "/notification" ? <NotificationSideBar/> : <SidebarInner/>;

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            {/* This is the first sidebar */}
            {/* We disable collapsible and adjust width to icon. */}
            {/* This will make the sidebar appear as icons. */}
            <Sidebar
                collapsible="none"
                className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <a href="#">
                                    <div
                                        className="flex aspect-square size-8 items-center justify-center rounded-lg bg-unread text-unread-foreground">
                                        <Image width={20} height={20} alt={"Logo"} src={'/logo.svg'}></Image>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu>
                                {navMain.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: item.title,
                                                hidden: false,
                                            }}
                                            onClick={() => {
                                                router.push(item.url)
                                            }}
                                            isActive={path === item.url}
                                            className="px-2.5 md:px-2"
                                        >
                                            <span className="relative flex shrink-0">
                                                <item.icon/>
                                                {item.hasIndicator ? (
                                                    <span className="absolute right-0 top-0 size-2 rounded-full bg-unread ring-2 ring-sidebar"/>
                                                ) : null}
                                            </span>
                                            <span className="sr-only">{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={user}/>
                </SidebarFooter>
            </Sidebar>
            <Sidebar collapsible="none" className="hidden flex-1 md:flex">
                {sideInner}
            </Sidebar>
        </Sidebar>
    )
}
