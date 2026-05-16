import {AppSidebar} from "@/components/aside"
import type {CSSProperties, ReactNode} from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {TooltipProvider} from "@/components/ui/tooltip";
import {SessionProvider} from "@/components/auth/session-provider";
import {ChatProvider} from "@/components/index/chat-provider";
import {LoggedShellTitle} from "@/components/app/logged-shell-title";

export default function layout({children}: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ChatProvider>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "350px",
                        } as CSSProperties
                    }
                >
                    <TooltipProvider>
                        <AppSidebar/>
                    </TooltipProvider>
                    <SidebarInset>
                        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
                            <SidebarTrigger className="-ml-1"/>
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">Telecat</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block"/>
                                    <LoggedShellTitle/>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </header>
                        <main className="flex min-h-0 flex-1 flex-col p-4">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </ChatProvider>
        </SessionProvider>
    )
}
