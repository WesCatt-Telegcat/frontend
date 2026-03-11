"use client"

import * as React from "react"
import {Bell, Inbox} from "lucide-react"

import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image";
import {useCallback} from "react";
import {SidebarInner} from "@/components/index/SidebarInner";
import {usePathname, useRouter} from "next/navigation";
import {NotificationSideBar} from "@/components/notification/NotificationSideBar";

// This is sample data
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "聊天",
            url: "/",
            icon: Inbox,
            isActive: true,
        },
        {
            title: '通知',
            url: '/notification',
            icon: Bell,
            isActive: false
        }
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    // Note: I'm using state to show active item.
    // IRL you should use the url/router.
    const [activeItem, setActiveItem] = React.useState(data.navMain[0])
    const path = usePathname();
    const router = useRouter();
    const SideInnerComponent = useCallback(() => {

        switch (path) {
            case "/":
                return <SidebarInner/>
            case "/notification":
                return <NotificationSideBar/>;
            default:
                break;
        }

    }, [path]);

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
                                        className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Image width={20} height={20} alt={"Logo"} src={'logo.svg'}></Image>
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
                                {data.navMain.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: item.title,
                                                hidden: false,
                                            }}
                                            onClick={() => {
                                                router.push(item.url)
                                                setActiveItem(item);
                                            }}
                                            isActive={activeItem?.title === item.title}
                                            className="px-2.5 md:px-2"
                                        >
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={data.user}/>
                </SidebarFooter>
            </Sidebar>
            <Sidebar collapsible="none" className="hidden flex-1 md:flex">
                <SideInnerComponent/>
            </Sidebar>
        </Sidebar>
    )
}
